import React, { useEffect, useState } from 'react'
import { FilecoinNumber } from '@openworklabs/filecoin-number'
import useLotusClient from '../lib/use-lotus-client'
import useMiners from '../lib/use-miners'

export default function ProposeDeal ({ appState, updateAppState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  const miners = useMiners(client)
  const [objectUrlAttribute, setObjectUrlAttribute] = useState()
  const [balance, setBalance] = useState()
  const [status, setStatus] = useState()
  const cid = appState.cid
  const width = appState.capture.width
  const height = appState.capture.height
  const defaultWalletAddress = appState.defaultWalletAddress
  const epochPrice = '2500'

  useEffect(() => {
    const objectUrl = URL.createObjectURL(appState.capture.blob)
    setObjectUrlAttribute({ src: objectUrl })
    return () => {
      setObjectUrlAttribute(null)
      URL.revokeObjectURL(objectUrl)
    }
  }, [appState.capture])

  useEffect(() => {
    let state = { canceled: false }
    if (!client) return
    ;(async function run () {
      if (state.canceled) return
      const defaultWalletAddress = await client.walletDefaultAddress()
      if (state.canceled) return
      updateAppState(draft => {
        draft.defaultWalletAddress = defaultWalletAddress
      })
      const balance = await client.walletBalance(defaultWalletAddress)
      if (state.canceled) return
      setBalance(new FilecoinNumber(balance, 'attofil'))
      setTimeout(run, 1000)
    })()
    return () => {
      state.canceled = true
    }
  }, [client, updateAppState])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>Propose</h2>
      <div style={{ display: 'flex' }}>
        <div style={{ border: '1px solid black', height }}>
          <img alt='' width={width} height={height} {...objectUrlAttribute} />
        </div>
        <div style={{ padding: '1rem' }}>
          <div>{appState.capture.blob.size} bytes</div>
          <div>Uploaded to Node #{selectedNode}</div>
          <button
            onClick={() => {
              updateAppState(draft => {
                delete draft.capture
                delete draft.cid
              })
            }}
          >
            Retake
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'left', fontSize: '80%', marginTop: '0.5rem' }}>
        <div>
          CID: <span style={{ fontSize: '70%' }}>{cid}</span>
        </div>
        <div>
          Wallet:{' '}
          <span style={{ fontSize: '50%' }}>{defaultWalletAddress}</span>
        </div>
        <div>Balance: {typeof balance !== 'undefined' && balance.toFil()}</div>
      </div>
      <h4>Click a Miner to Propose a Deal</h4>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {miners &&
          miners.map(miner => {
            return (
              <button
                key={miner}
                style={{ width: '15vw' }}
                onClick={() => proposeDeal(miner)}
              >
                {miner}
              </button>
            )
          })}
      </div>
      <div>{status}</div>
    </div>
  )

  async function proposeDeal (targetMiner) {
    const dataRef = {
      Data: {
        TransferType: 'graphsync',
        Root: {
          '/': cid
        },
        PieceCid: null,
        PieceSize: 0
      },
      Wallet: defaultWalletAddress,
      Miner: targetMiner,
      EpochPrice: epochPrice,
      MinBlocksDuration: 300
    }
    setStatus('Proposing...')
    try {
      const result = await client.clientStartDeal(dataRef)
      const { '/': proposalCid } = result
      setStatus('Proposed: ' + proposalCid)
      updateAppState(draft => {
        draft.proposalCid = proposalCid
      })
    } catch (e) {
      setStatus('Error: ' + e.message)
      console.log('Exception', e)
    }
  }
}
