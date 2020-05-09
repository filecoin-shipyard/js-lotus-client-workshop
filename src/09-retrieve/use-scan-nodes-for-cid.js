import { useEffect, useState } from 'react'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
// import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'
import schema from '../lotus-client-schema-testnet-v3'
import { useImmer } from 'use-immer'

export default function useScanNodesForCid ({ appState, cid }) {
  const [scanningState, setScanningState] = useState({ state: 'idle' })
  const [found, updateFound] = useImmer([])
  const { available } = appState

  useEffect(() => {
    if (!cid || !available) return
    const api = 'lotus.testground.ipfs.team/api'
    let state = { canceled: false }
    updateFound(draft => {
      draft = []
    })
    async function run () {
      if (state.canceled) return
      let count = 1
      for (const nodeNum in available) {
        setScanningState({
          state: 'scanning',
          currentNode: count++,
          numNodes: available.length
        })
        const url = `https://${api}/${nodeNum}/node/rpc/v0`
        const provider = new BrowserProvider(url, {
          transport: 'http',
          token: async () => {
            // FIXME: Need to cache these
            const tokenUrl = `https://${api}/${nodeNum}/testplan/.lotus/token`
            const response = await fetch(tokenUrl)
            return await response.text()
          }
        })
        const client = new LotusRPC(provider, { schema })
        try {
          if (state.canceled) return
          const hasLocal = await client.clientHasLocal({ '/': cid })
          if (state.canceled) return
          // console.log('Retrieve hasLocal:', nodeNum, hasLocal)
          if (hasLocal) {
            updateFound(draft => {
              draft.push({
                node: nodeNum,
                local: true
              })
            })
          }
          const offers = await client.clientFindData({ '/': cid })
          if (state.canceled) return
          // console.log('Retrieve findData:', nodeNum, offers)
          updateFound(draft => {
            for (const offer of offers) {
              if (offer.Err !== '') continue
              if (offer.Size === 0) continue
              draft.push({
                node: nodeNum,
                remoteOffer: offer
              })
            }
          })
        } catch (e) {
          console.warn('Node error:', nodeNum, e)
        }
      }
      setScanningState({
        state: 'finished',
        numNodes: available.length
      })
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [available, cid, updateFound, setScanningState])

  return [found, scanningState]
}
