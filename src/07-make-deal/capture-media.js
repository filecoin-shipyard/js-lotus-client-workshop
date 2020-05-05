import React, { useCallback, useEffect, useRef, useState } from 'react'
import useLotusClient from '../lib/use-lotus-client'

export default function CaptureMedia ({ appState, updateAppState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  const videoRef = useRef()
  const canvasRef = useRef()
  const [opened, setOpened] = useState()
  const [height, setHeight] = useState(75)
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>Capture</h2>
      <div style={{ border: '1px solid green', height }}>
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
        const cid = await client.import(blob)
        console.log('Imported', cid)
        updateAppState(draft => {
          draft.capture = {
            quality,
            blob,
            width,
            height,
          }
          draft.cid = cid
        })
        break
      }
    }
  }
}
