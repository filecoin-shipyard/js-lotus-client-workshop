import { useEffect, useCallback } from 'react'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'

export default function useTestgroundNet ({ appState, updateAppState }) {
  const updateAvailable = useCallback(
    updateFunc => {
      updateAppState(draft => {
        if (!draft.available) {
          draft.available = []
        }
        updateFunc(draft.available)
      })
    },
    [updateAppState]
  )
  const { selectedNode, nodesScanned } = appState

  useEffect(() => {
    if (nodesScanned) return
    const api = 'lotus.testground.ipfs.team/api'
    let state = { canceled: false }
    updateAvailable(draft => {
      draft.splice(0) // clear array
    })
    async function run () {
      if (state.canceled) return
      const paramsUrl = 'https://' + api + `/0/testplan/params`
      const response = await fetch(paramsUrl)
      const { TestInstanceCount: nodeCount } = await response.json()
      if (state.canceled) return
      const available = {}
      for (let i = 0; i < nodeCount; i++) {
        const url = 'https://' + api + `/${i}/miner/rpc/v0`
        const provider = new BrowserProvider(url, { transport: 'http' })
        const client = new LotusRPC(provider, { schema })
        try {
          const minerAddress = await client.actorAddress()
          available[i] = minerAddress
          updateAvailable(draft => {
            draft[i] = minerAddress
          })
        } catch (e) {
          console.warn('Node error:', i, e)
        }
      }
      updateAppState(draft => {
        draft.nodesScanned = true
      })
      if (typeof selectedNode === 'undefined' || !available[selectedNode]) {
        // Select a random node
        const keys = Object.keys(available)
        const randomIndex =  Math.floor(Math.random() * Math.floor(keys.length))
        updateAppState(draft => {
          draft.selectedNode = Number(keys[randomIndex])
        })
      }
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [updateAppState, updateAvailable, nodesScanned, selectedNode])
}
