import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { BrowserProvider } from '@filecoin-shipyard/lotus-client-provider-browser'
import { testnet } from '@filecoin-shipyard/lotus-client-schema'
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
          } else if (entry.ipfsPin) {
            return <div key={i}>Node #{entry.node}: Pinned to IPFS</div>
          } else {
            return (
              <div key={i}>
                Node #{entry.node}: Via miner owned by account{' '}
                {entry.remoteOffer.Miner}
                <div style={{ fontSize: '70%', margin: '0.5rem 1rem' }}>
                  Retrieval Price: {entry.remoteOffer.MinPrice}
                  <br />
                  <button
                    style={{ marginTop: '0.3rem' }}
                    onClick={retrieveAsJpegToFs}
                  >
                    Retrieve as JPEG from Node #{entry.node} to Filesystem
                  </button>
                  <button
                    style={{ marginTop: '0.3rem' }}
                    onClick={retrieveAsJpegToIpfs}
                  >
                    Retrieve as JPEG from Node #{entry.node} to IPFS
                  </button>
                  {retrievals[i] && (
                    <>
                      <div>State: {retrievals[i].state}</div>
                      {retrievals[i].error && (
                        <div>Error: {retrievals[i].error.message}</div>
                      )}
                      {retrievals[i].url && (
                        <img src={retrievals[i].url} alt='retrieved' />
                      )}
                    </>
                  )}
                </div>
              </div>
            )

            async function retrieveAsJpegToFs () {
              console.log('Retrieve as Jpeg', i, entry)
              const randomId = Math.floor(
                Math.random() * Number.MAX_SAFE_INTEGER
              )
              const o = entry.remoteOffer
              try {
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'retrieving'
                  }
                })
                const api = 'lotus.testground.ipfs.team/api'
                const wsUrl = 'wss://' + api + `/${entry.node}/node/rpc/v0`
                const provider = new BrowserProvider(wsUrl, {
                  token: async () => {
                    const tokenUrl =
                      'https://' + api + `/${entry.node}/testplan/.lotus/token`
                    const response = await fetch(tokenUrl)
                    return await response.text()
                  },
                  transport: 'http'
                })
                const retrieveClient = new LotusRPC(provider, { schema: testnet.fullNode })
                const walletAddress = await retrieveClient.walletDefaultAddress()
                const retrievalOffer = {
                  Root: o.Root,
                  Size: o.Size,
                  Total: o.MinPrice,
                  PaymentInterval: o.PaymentInterval,
                  PaymentIntervalIncrease: o.PaymentIntervalIncrease,
                  Client: walletAddress,
                  Miner: o.Miner,
                  MinerPeerID: o.MinerPeerID
                }
                const fileRef = {
                  Path: `/root/downloads/${cid}-${randomId}.jpg`,
                  IsCAR: false
                }
                console.log('Jim clientRetrieve', retrievalOffer, fileRef)
                const result = await retrieveClient.clientRetrieve(
                  retrievalOffer,
                  fileRef
                )
                console.log('Retrieve result', result)
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'success',
                    url:
                      `https://lotus.testground.ipfs.team/api/` +
                      `${entry.node}/testplan/downloads/` +
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

            async function retrieveAsJpegToIpfs () {
              console.log('Retrieve as Jpeg to Ipfs', i, entry)
              const randomId = Math.floor(
                Math.random() * Number.MAX_SAFE_INTEGER
              )
              const o = entry.remoteOffer
              try {
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'retrieving'
                  }
                })
                const api = 'lotus.testground.ipfs.team/api'
                const wsUrl = 'wss://' + api + `/${entry.node}/node/rpc/v0`
                const provider = new BrowserProvider(wsUrl, {
                  token: async () => {
                    const tokenUrl =
                      'https://' + api + `/${entry.node}/testplan/.lotus/token`
                    const response = await fetch(tokenUrl)
                    return await response.text()
                  },
                  transport: 'http'
                })
                const retrieveClient = new LotusRPC(provider, { schema: testnet.fullNode })
                const walletAddress = await retrieveClient.walletDefaultAddress()
                const retrievalOffer = {
                  Root: o.Root,
                  Size: o.Size,
                  Total: o.MinPrice,
                  PaymentInterval: o.PaymentInterval,
                  PaymentIntervalIncrease: o.PaymentIntervalIncrease,
                  Client: walletAddress,
                  Miner: o.Miner,
                  MinerPeerID: o.MinerPeerID
                }
                console.log('Jim clientRetrieve IPFS', retrievalOffer)
                const result = await retrieveClient.clientRetrieve(
                  retrievalOffer,
                  null
                )
                console.log('Retrieve IPFS result', result)
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'success',
                    url:
                      `https://lotus.testground.ipfs.team/api/` +
                      `${entry.node}/ipfs-gateway/ipfs/${cid}`
                  }
                })
              } catch (e) {
                console.error('Retrieve IPFS error', e)
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
              spellCheck='false'
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
