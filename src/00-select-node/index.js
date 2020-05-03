import React, { useEffect } from 'react'
import { useImmer } from 'use-immer'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'

export default function SelectNode () {
  const [available, updateAvailable] = useImmer([])

  useEffect(() => {
    const api = 'lotus.testground.ipfs.team/api'
    let state = { canceled: false }
    async function run () {
      if (state.canceled) return
      const paramsUrl = 'https://' + api + `/0/testplan/params`
      const response = await fetch(paramsUrl)
      const { TestInstanceCount: nodeCount } = await response.json()
      if (state.canceled) return
      for (let i = 0; i < nodeCount; i++) {
        const url = 'https://' + api + `/${i}/miner/rpc/v0`
        const provider = new BrowserProvider(url, { transport: 'http' })
        const client = new LotusRPC(provider, { schema })
        try {
          const minerAddress = await client.actorAddress()
          updateAvailable(draft => {
            draft[i] = minerAddress
          })
        } catch (e) {
          console.warn('Node error:', i, e)
        }
      }
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [updateAvailable])

  return (
    <div>
      <h2>Available Nodes</h2>
      <ul>
        {available.map((miner, i) => (
          <li key={i}>
            {i}: {miner}
          </li>
        ))}
      </ul>
    </div>
  )
}
