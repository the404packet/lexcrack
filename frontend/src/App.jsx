import { useState, useRef, useCallback } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── How-to Modal ─────────────────────────────────────────────────────────────
function HowToModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-icon">📖</div>
        <h2 className="modal-title">How to Use LexCrack</h2>
        <div className="modal-steps">
          <div className="step">
            <span className="step-num">01</span>
            <div>
              <strong>Enter your letters</strong>
              <p>Type the letters you have available (e.g. <code>aetrs</code>). Spaces are ignored automatically.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">02</span>
            <div>
              <strong>Use <code>?</code> for wildcards</strong>
              <p>A <code>?</code> stands for any letter. Example: <code>aet?</code> treats <code>?</code> as a blank tile.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">03</span>
            <div>
              <strong>Filter by length (optional)</strong>
              <p>Enter comma-separated lengths like <code>3,4,5</code> to see only words of those sizes. Leave blank to see all.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">04</span>
            <div>
              <strong>Scoring</strong>
              <p>Common words are shown first, followed by valid words.</p>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onClose}>Got it!</button>
      </div>
    </div>
  )
}

// ─── Word Card ────────────────────────────────────────────────────────────────
function WordCard({ length, words, animDelay }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? words : words.slice(0, 10)
  const hasMore = words.length > 10

  return (
    <div
      className="word-card"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="word-card-header">
        <div className="word-card-title">
          <span className="length-badge">{length}</span>
          <span className="length-label">letter word{length > 1 ? 's' : ''}</span>
        </div>
        <span className="word-count">{words.length} found</span>
      </div>
      <div className={`word-list ${expanded ? 'word-list--expanded' : ''}`}>
        {shown.map((w, i) => (
          <span key={w} className="word-chip" style={{ animationDelay: `${animDelay + i * 20}ms` }}>
            {w}
          </span>
        ))}
      </div>
      {hasMore && (
        <button
          className="btn btn-ghost show-more"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? '▲ Show less' : `▼ Show ${words.length - 10} more`}
        </button>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [letters, setLetters] = useState('')
  const [lengths, setLengths] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lettersError, setLettersError] = useState('')
  const [lengthsError, setLengthsError] = useState('')
  const abortRef = useRef(null)

  // Input validation
  const handleLettersChange = (e) => {
    const val = e.target.value.replace(/\s+/g, '')
    setLetters(val)
    if (val && !/^[a-zA-Z?]*$/.test(val)) {
      setLettersError('Only a–z and ? allowed')
    } else if (val.length > 15) {
      setLettersError('Max 15 characters')
    } else {
      setLettersError('')
    }
  }

  const handleLengthsChange = (e) => {
    const val = e.target.value
    setLengths(val)
    if (val.trim()) {
      const parts = val.split(',').map(s => s.trim()).filter(Boolean)
      const invalid = parts.some(p => !/^\d+$/.test(p) || +p < 2 || +p > 15)
      setLengthsError(invalid ? 'Use numbers 2–15, comma-separated' : '')
    } else {
      setLengthsError('')
    }
  }

  const handleSolve = useCallback(async () => {
    const clean = letters.replace(/\s+/g, '').toLowerCase()
    if (!clean) { setLettersError('Enter at least one letter'); return }
    if (lettersError || lengthsError) return

    // Parse lengths
    let parsedLengths = []
    if (lengths.trim()) {
      parsedLengths = lengths.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 2 && n <= 15)
    }

    // Cancel previous
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letters: clean, lengths: parsedLengths }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error (${res.status})`)
      }

      const data = await res.json()
      const entries = Object.entries(data)
      if (entries.length === 0) {
        setError('No words found. Try different letters or remove length filters.')
      } else {
        setResults(data)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [letters, lengths, lettersError, lengthsError])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSolve()
  }

  const sortedLengths = results
    ? Object.keys(results).map(Number).sort((a, b) => a - b)
    : []

  const totalWords = results
    ? sortedLengths.reduce((sum, l) => sum + results[l].length, 0)
    : 0

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-lex">Lex</span><span className="logo-crack">Crack</span>
        </div>
        <button className="btn btn-ghost how-to-btn" onClick={() => setShowModal(true)}>
          ? How to use
        </button>
      </header>

      {/* Hero tagline */}
      <div className="hero">
        <p className="tagline">Crack every word game with precision.</p>
      </div>

      {/* Input panel */}
      <main className="main">
        <div className="input-panel">
          <div className="input-group">
            <label className="input-label" htmlFor="letters">
              Letters
              <span className="input-hint">a–z and ? for wildcards</span>
            </label>
            <input
              id="letters"
              className={`input ${lettersError ? 'input--error' : ''}`}
              type="text"
              value={letters}
              onChange={handleLettersChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. aetr?s"
              maxLength={20}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
            />
            {lettersError && <span className="field-error">{lettersError}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="lengths">
              Word lengths
              <span className="input-hint">optional, e.g. 3,4,5</span>
            </label>
            <input
              id="lengths"
              className={`input ${lengthsError ? 'input--error' : ''}`}
              type="text"
              value={lengths}
              onChange={handleLengthsChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 2,3,4"
              spellCheck={false}
              autoComplete="off"
            />
            {lengthsError && <span className="field-error">{lengthsError}</span>}
          </div>

          <button
            className="btn btn-primary solve-btn"
            onClick={handleSolve}
            disabled={loading || !!lettersError || !!lengthsError}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Solving…
              </>
            ) : (
              <>
                Crack
              </>
            )}
          </button>

          <p className="cold-start-notice">
            ℹ️ Your first request may take up to 30 seconds as the server wakes up from idle. Subsequent requests will be fast.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="error-box" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Results</h2>
              <div className="results-meta">
                <span className="meta-pill">{totalWords} words</span>
                <span className="meta-pill">{sortedLengths.length} lengths</span>
              </div>
            </div>
            <div className="results-grid">
              {sortedLengths.map((len, i) => (
                <WordCard
                  key={len}
                  length={len}
                  words={results[len]}
                  animDelay={i * 60}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        Made with ❤️ by Somanshu Mahajan
      </footer>

      {/* Modal */}
      {showModal && <HowToModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
