import React, { useCallback, useEffect, useRef, useState } from 'react'

export default function CaptureMedia ({ appState, updateAppState }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const photoRef = useRef()
  const [opened, setOpened] = useState()
  const [height, setHeight] = useState(75)
  const [objectUrlAttribute, setObjectUrlAttribute] = useState()
  const width = 100
  const stream = appState.stream

  const canPlay = useCallback(ev => {
    const video = videoRef.current
    console.log('canplay', ev, video.videoWidth, video.videoHeight)
    const height = video.videoHeight / (video.videoWidth / width)
    setHeight(height)
  }, [])

  const wrappedVideoRef = useCallback(node => {
    if (videoRef.current) {
      videoRef.current.removeEventListener('canplay', canPlay)
      videoRef.current = null
    }
    if (node) {
      videoRef.current = node
      node.addEventListener('canplay', canPlay)
    }
  }, [canPlay])

  useEffect(() => {
    if (appState.capture && appState.capture.blob) {
      const objectUrl = URL.createObjectURL(appState.capture.blob)
      setObjectUrlAttribute({ src: objectUrl })
      return () => {
        setObjectUrlAttribute(null)
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [appState.capture])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        updateAppState(draft => {
          draft.stream = null
        })
        setOpened(false)
      }
    }
  }, [stream, updateAppState])

  let sizePanel
  if (appState.capture && appState.capture.blob) {
    sizePanel = <span>{appState.capture.blob.size} bytes</span>
  } else {
    sizePanel = <span>No picture taken yet</span>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '90vh',
        justifyContent: 'space-around'
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>Capture</h2>
      <div style={{ border: '1px solid green', height: height + 2 }}>
        <video
          ref={wrappedVideoRef}
          autoPlay
          playsInline
          width={width}
          height={height}
        ></video>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'none', border: '1px solid blue', height: '30vh' }}
        width={width}
        height={height}
      />
      {!opened && (
        <button
          onClick={open}
          style={{
            width: '10rem',
            minHeight: '2rem',
            fontSize: 'large',
            margin: '1rem',
            flexShrink: 0
          }}
        >
          Open camera
        </button>
      )}
      {opened && (
        <button
          onClick={capture}
          style={{
            width: '10rem',
            minHeight: '2rem',
            fontSize: 'large',
            margin: '1rem',
            flexShrink: 0
          }}
        >
          Take Picture
        </button>
      )}
      <div style={{ border: '1px solid black', height: height + 2 }}>
        <img
          ref={photoRef}
          width={width}
          height={height}
          alt=""
          {...objectUrlAttribute}
        />
      </div>
      <div>{sizePanel}</div>
    </div>
  )

  async function open () {
    const constraints = {
      audio: false,
      video: true
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const videoTracks = stream.getVideoTracks()
    console.log('Got stream with constraints:', constraints)
    console.log(`Using video device: ${videoTracks[0].label}`)
    videoRef.current.srcObject = stream
    updateAppState(draft => { draft.stream = stream })
    setOpened(true)
  }

  async function capture () {
    var context = canvasRef.current.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, width, height)
    const maxSize = 1930
    for (let quality = 0.80; quality > 0; quality -= 0.05) {
      const promise = new Promise((resolve, reject) => {
        canvasRef.current.toBlob(
          blob => {
            console.log('Blob', quality, blob)
            resolve(blob)
          },
          'image/jpeg',
          quality
        )
      })
      const blob = await promise
      if (blob.size <= maxSize) {
        updateState(quality, blob, width, height)
        break
      }
    }
  }

  function updateState (quality, blob, width, height) {
    // Need to do in separate function because of Buble
    updateAppState(draft => {
      draft.capture = {
        quality,
        blob,
        width,
        height
      }
      delete draft.cid
    })
  }
}
