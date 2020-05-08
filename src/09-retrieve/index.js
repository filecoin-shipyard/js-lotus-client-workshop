import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import useLotusClient from '../lib/use-lotus-client'
import useWatchDefaultWallet from '../lib/use-watch-default-wallet'
import useScanNodesForCid from './use-scan-nodes-for-cid'

export default function Retrieve ({ appState, updateAppState }) {
  const { cid } = useParams()
  const [found, scanningState] = useScanNodesForCid({ appState, cid })
  const [formCid, setFormCid] = useState(cid || '')
  const [retrievals, updateRetrievals] = useImmer({})
  const history = useHistory()
  const { selectedNode, defaultWalletAddress } = appState
  const client = useLotusClient(selectedNode, 'node')
  const balance = useWatchDefaultWallet({ client, updateAppState })

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
                Node #{entry.node}: Via Miner {entry.remoteOffer.Miner}
                <div style={{ fontSize: '70%', margin: '0.5rem 1rem' }}>
                  Retrieval Price: {entry.remoteOffer.MinPrice}
                  <br />
                  <button
                    style={{ marginTop: '0.3rem' }}
                    onClick={retrieveAsJpeg}
                  >
                    Retrieve as JPEG
                  </button>
                  {retrievals[i] && (
                    <>
                      <div>State: {retrievals[i].state}</div>
                      {retrievals[i].error && (
                        <div>Error: {retrievals[i].error.message}</div>
                      )}
                      {retrievals[i].url && (
                        <img src={retrievals[i].url} alt="retrieved" />
                      )}
                    </>
                  )}
                </div>
              </div>
            )

            async function retrieveAsJpeg () {
              console.log('Retrieve as Jpeg', i, entry)
              const randomId = Math.floor(
                Math.random() * Number.MAX_SAFE_INTEGER
              )
              const o = entry.remoteOffer
              const retrievalOffer = {
                Root: o.Root,
                Size: o.Size,
                Total: o.MinPrice,
                PaymentInterval: o.PaymentInterval,
                PaymentIntervalIncrease: o.PaymentIntervalIncrease,
                Client: defaultWalletAddress,
                Miner: o.Miner,
                MinerPeerID: o.MinerPeerID
              }
              const fileRef = {
                Path: `/root/downloads/${cid}-${randomId}.jpg`,
                IsCAR: false
              }
              try {
                console.log('Jim clientRetrieve', retrievalOffer, fileRef)
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'retrieving'
                  }
                })
                const result = await client.clientRetrieve(
                  retrievalOffer,
                  fileRef
                )
                console.log('Retrieve result', result)
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'success',
                    url:
                      `https://lotus.testground.ipfs.team/api/` +
                      `${selectedNode}/testplan/downloads/` +
                      `${cid}-${randomId}.jpg`
                  }
                })
              } catch (e) {
                console.error('Retrieve error', e)
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'error',
                    error: e
                  }
                })
              }
            }
          }
        })}
      </div>
    )
  }

  return (
    <div>
      <h1>Retrieve</h1>
      <div>
        {cid && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              CID: <span style={{ fontSize: '70%' }}>{cid}</span>
            </div>
            <div>
              Wallet address:{' '}
              <span style={{ fontSize: '50%' }}>{defaultWalletAddress}</span>
            </div>
            <div>
              Balance: {typeof balance !== 'undefined' && balance.toFil()} FIL
            </div>
          </>
        )}
        {!cid && (
          <>
            <span>CID:</span>
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
          </>
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
