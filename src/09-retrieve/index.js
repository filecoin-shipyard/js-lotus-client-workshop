import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import { format, formatDistance } from 'date-fns'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { BrowserProvider } from '@filecoin-shipyard/lotus-client-provider-browser'
import { testnet } from '@filecoin-shipyard/lotus-client-schema'
import IpfsHttpClient from 'ipfs-http-client'
import useLotusClient from '../lib/use-lotus-client'
import useWatchDefaultWallet from '../lib/use-watch-default-wallet'
import useScanNodesForCid from './use-scan-nodes-for-cid'

export default function Retrieve ({ appState, updateAppState }) {
  const { cid } = useParams()
  const [found, scanningState] = useScanNodesForCid({ appState, cid })
  const [formCid, setFormCid] = useState(cid || '')
  const [retrievals, updateRetrievals] = useImmer({})
  const history = useHistory()
  const { available, selectedNode, defaultWalletAddress } = appState
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
            return (
              <div key={i}>
                Node #{entry.node}: Pinned to IPFS
                <button style={{ marginLeft: '0.5rem' }} onClick={unpin}>
                  Unpin and GC
                </button>
              </div>
            )

            async function unpin () {
              console.log('Unpin', entry.node, cid)
              try {
                const ipfs = IpfsHttpClient({
                  host: 'lotus.testground.ipfs.team',
                  port: 443,
                  protocol: 'https',
                  apiPath: `/api/${entry.node}/ipfs/api/v0`
                })
                //const results = await ipfs.pin.ls(cid)
                const results = await ipfs.pin.rm(cid)
                for await (const result of results) {
                  console.log('Jim ipfs.pin.rm', entry.node, cid, result)
                }
                await gc(available)
                document.location.reload()
              } catch (e) {
                // console.log('Error ipfs.pin.ls', nodeNum, cid)
              }
            }
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
                        <div>
                          <img src={retrievals[i].url} alt='retrieved' />
                          <div>
                            Elapsed time:{' '}
                            {formatDistance(
                              retrievals[i].startTime,
                              retrievals[i].endTime,
                              { includeSeconds: true }
                            )}
                          </div>
                        </div>
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
              const startTime = Date.now()
              try {
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'retrieving',
                    startTime
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
                /* Sample from CLI
                [
                  {
                    "Root": {
                      "/": "QmTpua3DsQvNiLMQYq2jNHuoULc9aCyf7orrPEJ4ArkWay"
                    },
                    "Piece": null,
                    "Size": 2048,
                    "Total": "4096",
                    "UnsealPrice": "0",
                    "PaymentInterval": 1048576,
                    "PaymentIntervalIncrease": 1048576,
                    "Client": "t3q32u43bpqph75drafx3uzz7vyilnmpxnfornt4ioswg4rnbyv324xv4nzdoueowujkp5ruusplpex67daswa",
                    "Miner": "t0100",
                    "MinerPeer": {
                      "Address": "t01000",
                      "ID": "12D3KooWAz5EG6omp5qJ2ZwUMrDFDqnQfkvxfqUjWFMqLyg9hCXF",
                      "PieceCID": {
                        "/": "baga6ea4seaqprbncq7j72kda536tffedf6rycximtxt5l45kjavfirjvek4eypq"
                      }
                    }
                  },
                  {
                    "Path": "/root/downloads/test2.jpg",
                    "IsCAR": false
                  }
                ]
                */
                const retrieveClient = new LotusRPC(provider, {
                  schema: testnet.fullNode
                })
                const walletAddress = await retrieveClient.walletDefaultAddress()
                const retrievalOffer = {
                  Root: o.Root,
                  Piece: null,
                  Size: o.Size,
                  Total: o.MinPrice,
                  UnsealPrice: o.UnsealPrice,
                  PaymentInterval: o.PaymentInterval,
                  PaymentIntervalIncrease: o.PaymentIntervalIncrease,
                  Client: walletAddress,
                  Miner: o.Miner,
                  MinerPeer: o.MinerPeer
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
                const endTime = Date.now()
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'success',
                    startTime,
                    endTime,
                    url:
                      `https://lotus.testground.ipfs.team/api/` +
                      `${entry.node}/testplan/downloads/` +
                      `${cid}-${randomId}.jpg`
                  }
                })
              } catch (e) {
                console.error('Retrieve error', e)
                const errorTime = Date.now()
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'error',
                    errorTime,
                    error: e
                  }
                })
              }
            }

            async function retrieveAsJpegToIpfs () {
              console.log('Retrieve as Jpeg to Ipfs', i, entry)
              const o = entry.remoteOffer
              const startTime = Date.now()
              try {
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'retrieving',
                    startTime
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
                const retrieveClient = new LotusRPC(provider, {
                  schema: testnet.fullNode
                })
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
                const endTime = Date.now()
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'success',
                    startTime,
                    endTime,
                    url:
                      `https://lotus.testground.ipfs.team/api/` +
                      `${entry.node}/ipfs-gateway/ipfs/${cid}`
                  }
                })
              } catch (e) {
                console.error('Retrieve IPFS error', e)
                const errorTime = Date.now()
                updateRetrievals(draft => {
                  draft[i] = {
                    state: 'error',
                    errorTime,
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
            <>
              Scanned {scanningState.numNodes} nodes
              <div>
                <button onClick={() => gc(available)}>GC all IPFS Nodes</button>
              </div>
            </>
          )}
        </div>
      )}
      {content}
    </div>
  )
}

async function gc (available) {
  for (const nodeNum in available) {
    try {
      const ipfs = IpfsHttpClient({
        host: 'lotus.testground.ipfs.team',
        port: 443,
        protocol: 'https',
        apiPath: `/api/${nodeNum}/ipfs/api/v0`
      })
      console.log(`GC Node #${nodeNum}`)
      const results = await ipfs.repo.gc()
      for await (const { cid } of results) {
        console.log('GC: ', cid)
      }
    } catch (e) {
      console.error('Error ipfs.repo.gc', nodeNum, e)
    }
  }
}
