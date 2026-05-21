import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const reader = new BrowserMultiFormatReader()

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (!active || !result) return
      active = false
      controlsRef.current?.stop()
      onDetected(result.getText())
      onClose()
    })
      .then(controls => {
        controlsRef.current = controls
        if (!active) controls.stop()
      })
      .catch(() => {
        if (active) setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
      })

    return () => {
      active = false
      controlsRef.current?.stop()
    }
  }, [])

  function handleClose() {
    controlsRef.current?.stop()
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
