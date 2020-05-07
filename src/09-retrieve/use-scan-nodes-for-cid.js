import { useEffect, useState } from 'react'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
// import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'
import schema from '../lotus-client-schema-testnet-v3'
import { useImmer } from 'use-immer'

export default function useScanNodesForCid ({ appState, cid }) {
  const [scanned, setScanned] = useState(false)
  const [found, updateFound] = useImmer([])
  const { available } = appState

  useEffect(() => {
    if (!cid || !available) return
    // setScanned(false)
    const api = 'lotus.testground.ipfs.team/api'
    let state = { canceled: false }
    updateFound(draft => { draft = [] })
    async function run () {
      if (state.canceled) return
      for (const nodeNum in available) {
        const url = `https://${api}/${nodeNum}/node/rpc/v0`
        const provider = new BrowserProvider(url, {
          transport: 'http',
          token: async () => { // FIXME: Need to cache these
            const tokenUrl = `https://${api}/${nodeNum}/testplan/.lotus/token`
            const response = await fetch(tokenUrl)
            return await response.text()
          }
        })
        const client = new LotusRPC(provider, { schema })
        try {
          if (state.canceled) return
          const hasLocal = await client.clientHasLocal({'/': cid})
          if (state.canceled) return
          console.log('Retrieve hasLocal:', nodeNum, hasLocal)
          if (hasLocal) {
            updateFound(draft => {
              draft.push({
                node: nodeNum,
                local: true
              })
            })
          }
          const findData = await client.clientFindData({'/': cid})
          if (state.canceled) return
          console.log('Retrieve findData:', nodeNum, findData)
          updateFound(draft => {
            for (const found of findData) {
              if (found.Err !== '') return
              draft.push({
                node: nodeNum,
                remote: found
              })
            }
          })
        } catch (e) {
          console.warn('Node error:', nodeNum, e)
        }
      }
      // setScanned(true)
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [scanned, available, cid, updateFound])

  return [found, scanned]
}
