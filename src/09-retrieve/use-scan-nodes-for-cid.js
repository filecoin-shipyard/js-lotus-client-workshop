import { useEffect, useState } from 'react'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { BrowserProvider } from '@filecoin-shipyard/lotus-client-provider-browser'
import { testnet } from '@filecoin-shipyard/lotus-client-schema'
import { useImmer } from 'use-immer'
import IpfsHttpClient from 'ipfs-http-client'

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
        try {
          const ipfs = IpfsHttpClient({
            host: 'lotus.testground.ipfs.team',
            port: 443,
            protocol: 'https',
            apiPath: `/api/${nodeNum}/ipfs/api/v0`
          })
          const results = ipfs.pin.ls()
          for await (const { cid: resultCid } of results) {
            // console.log('Jim ipfs.pin.ls', nodeNum, cid, resultCid.toString())
            if (cid === resultCid.toString()) {
              updateFound(draft => {
                draft.push({
                  node: nodeNum,
                  ipfsPin: true
                })
              })
            }
          }
        } catch (e) {
          console.warn('Error ipfs.pin.ls', nodeNum, cid, e)
        }
        const client = new LotusRPC(provider, { schema: testnet.fullNode })
        try {
          if (state.canceled) return
          /*
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
          */
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
