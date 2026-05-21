import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
      if (result) {
        onDetected(result.getText())
        handleClose()
      }
      if (err && !(err.message?.includes('No MultiFormat'))) {
        setError('Impossible d\'accéder à la caméra.')
      }
    }).catch(() => setError('Impossible d\'accéder à la caméra.'))

    return () => handleClose()
  }, [])

  function handleClose() {
    try { BrowserMultiFormatReader.releaseAllStreams() } catch {}
    onClose()
  }

  return (
    <div className="scanner-overlay" onClick={handleClose}>
      <div className="scanner-modal" onClick={e => e.stopPropagation()}>
        <div className="scanner-header">
          <span>Scanner un code-barre</span>
          <button className="scanner-close" onClick={handleClose}>✕</button>
        </div>
        {error ? (
          <p className="error" style={{ padding: '24px', textAlign: 'center' }}>{error}</p>
        ) : (
          <div className="scanner-viewport">
            <video ref={videoRef} className="scanner-video" />
            <div className="scanner-crosshair" />
          </div>
        )}
        <p className="hint" style={{ textAlign: 'center', padding: '12px' }}>
          Pointez la caméra vers le code-barre
        </p>
      </div>
    </div>
  )
}
