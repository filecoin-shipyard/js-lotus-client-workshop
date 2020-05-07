import React, { useState } from 'react'
import useScanNodesForCid from './use-scan-nodes-for-cid'

export default function Retrieve ({ appState }) {
  const [cid, setCid] = useState()
  const [found] = useScanNodesForCid({ appState, cid })
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
      <pre>
        {JSON.stringify(found, null, 2)}
      </pre>
    </div>
  )
}
