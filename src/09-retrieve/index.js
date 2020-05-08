import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import useScanNodesForCid from './use-scan-nodes-for-cid'

export default function Retrieve ({ appState }) {
  const { cid } = useParams()
  const [found, scanningState] = useScanNodesForCid({ appState, cid })
  const [formCid, setFormCid] = useState(cid || '')
  const [retrievals, updateRetrievals] = useImmer({})
  const history = useHistory()

  useEffect(() => {
    setFormCid(cid || '')
  }, [cid])

  let content
  if (!found || found.length === 0) {
    content = null
  } else {
    content = (
      <div>
        {found.map((entry, i) => {
          if (entry.local) {
            return <div key={i}>Node #{entry.node}: Imported locally</div>
          } else {
            return (
              <div key={i}>
                Node #{entry.node}: Via Miner {entry.remote.Miner}
                <div style={{ fontSize: '70%', margin: '0.5rem 1rem' }}>
                  Retrieval Price: {entry.remote.MinPrice}
                  <br />
                  <button
                    style={{ marginTop: '0.3rem' }}
                    onClick={retrieveAsJpeg}
                  >
                    Retrieve as JPEG
                  </button>
                </div>
              </div>
            )

            function retrieveAsJpeg () {
              console.log('Retrieve as Jpeg', i, entry)
            }
          }
        })}
        <pre>{JSON.stringify(found, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div>
      <h1>Retrieve</h1>
      <div>
        CID: {cid && <span style={{fontSize: '70%'}}>{cid}</span>}
        {!cid && (
          <input
            type='text'
            value={formCid}
            onChange={e => {
              setFormCid(e.target.value)
              updateRetrievals(draft => {
                draft = {}
              })
              history.push(`/retrieve`)
            }}
            style={{ width: '90%' }}
          ></input>
        )}
      </div>
      {!cid && (
        <button onClick={() => history.push(`/retrieve/${formCid}`)}>
          Find and Download
        </button>
      )}
      {scanningState && (
        <div style={{ padding: '1rem' }}>
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
      {content}
    </div>
  )
}
