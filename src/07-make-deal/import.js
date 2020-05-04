({ tourState, updateTourState }) => {
  const [objectUrlAttribute, setObjectUrlAttribute] = useState()
  const cid = tourState.cid
  let width = 100
  let height = 75

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

  let sizePanel
  if (tourState.capture && tourState.capture.blob) {
    sizePanel = <span>{tourState.capture.blob.size} bytes</span>
    width = tourState.capture.width
    height = tourState.capture.height
  } else {
    return (
      <div>
        <h2>Import</h2>
        No picture taken yet
      </div>
    )
  }

  let buttonOrCid
  if (cid) {
    buttonOrCid = <div style={{ fontSize: 'small' }}>CID: {cid}</div>
  } else {
    buttonOrCid = (
      <button
        onClick={doImport}
        style={{
          width: '10rem',
          minHeight: '2rem',
          fontSize: 'large',
          margin: '1rem'
        }}
      >
        Import
      </button>
    )

    async function doImport () {
      const cid = await client.import(tourState.capture.blob)
      console.log('Imported', cid)
      updateTourState(draft => { draft.cid = cid })
    }
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
      <h2 style={{ marginBottom: '1rem' }}>Import</h2>
      <div style={{ border: '1px solid black', height: height + 2 }}>
        <img width={width} height={height} {...objectUrlAttribute} />
      </div>
      <div>{sizePanel}</div>
      {buttonOrCid}
    </div>
  )
}
