({ tourState, updateTourState }) => {
  const videoRef = useRef()
  const canvasRef = useRef()
  const photoRef = useRef()
  const [opened, setOpened] = useState()
  const [height, setHeight] = useState(75)
  const [objectUrlAttribute, setObjectUrlAttribute] = useState()
  const width = 100
  const stream = tourState.stream

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
  }, [])

  useEffect(() => {
    if (tourState.capture && tourState.capture.blob) {
      const objectUrl = URL.createObjectURL(tourState.capture.blob)
      setObjectUrlAttribute({ src: objectUrl })
      return () => {
        setObjectUrlAttribute(null)
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [tourState.capture])

  useEffect(() => {
    function checkClose () {
      if (stream && tourState.index !== slideIndex) {
        stream.getTracks().forEach(track => track.stop())
        updateTourState(draft => {
          draft.stream = null
        })
        setOpened(false)
      }
    }
    checkClose()
    return checkClose
  }, [tourState.index, opened, stream])

  let sizePanel
  if (tourState.capture && tourState.capture.blob) {
    sizePanel = <span>{tourState.capture.blob.size} bytes</span>
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
            margin: '1rem'
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
            margin: '1rem'
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
          {...objectUrlAttribute}
        />
      </div>
      <div>{sizePanel}</div>
    </div>
  )

  async function open () {
    constraints = {
      audio: false,
      video: true
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const videoTracks = stream.getVideoTracks()
    console.log('Got stream with constraints:', constraints)
    console.log(`Using video device: ${videoTracks[0].label}`)
    videoRef.current.srcObject = stream
    updateTourState(draft => { draft.stream = stream })
    setOpened(true)
  }

  async function capture () {
    var context = canvasRef.current.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, width, height)
    const maxSize = 1930
    let quality
    for (quality = 0.95; quality > 0; quality -= 0.01) {
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
    updateTourState(draft => {
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
