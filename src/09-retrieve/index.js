import React, { useState } from 'react'
import useScanNodesForCid from './use-scan-nodes-for-cid'

export default function Retrieve ({ appState }) {
  const [cid, setCid] = useState()
  const [found, scanningState] = useScanNodesForCid({ appState, cid })
  const [formCid, setFormCid] = useState('')

  return (
    <div>
      <h1>Retrieve</h1>
      <div>
        CID:{' '}
        <input
          type='text'
          value={formCid}
          onChange={e => {
            setFormCid(e.target.value)
            setCid(null)
          }}
          style={{ width: '90%' }}
        ></input>
      </div>
      <button onClick={() => setCid(formCid)}>Find and Download</button>
      {scanningState && (
        <div>
          {scanningState.state === 'scanning' && (
            <>
              Scanning {scanningState.currentNode} of {scanningState.numNodes}{' '}
              nodes...
            </>
          )}
          {scanningState.state === 'finished' && (
            <>Scanned {scanningState.numNodes} nodes</>
          )}
        </div>
      )}
      <pre>{JSON.stringify(found, null, 2)}</pre>
    </div>
  )
}
