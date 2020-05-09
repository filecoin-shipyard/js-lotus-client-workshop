import { useEffect, useCallback } from 'react'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
// import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'
import schema from '../lotus-client-schema-testnet-v3'

const api = 'lotus.testground.ipfs.team/api'

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
  const { selectedNode, nodesScanned, rescan, genesisCid } = appState

  useEffect(() => {
    if (nodesScanned && !(rescan > nodesScanned)) return
    let state = { canceled: false }
    updateAvailable(draft => {
      draft = []
    })
    async function run () {
      if (state.canceled) return
      if (!genesisCid) return
      const paramsUrl = `https://${api}/0/testplan/params`
      const response = await fetch(paramsUrl)
      const { TestInstanceCount: nodeCount } = await response.json()
      if (state.canceled) return
      const available = {}
      for (let i = 0; i < nodeCount; i++) {
        const url = `https://${api}/${i}/miner/rpc/v0`
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
        draft.nodesScanned = Date.now()
      })
      if (typeof selectedNode === 'undefined' || !available[selectedNode]) {
        // Select a random node
        const keys = Object.keys(available)
        const randomIndex = Math.floor(Math.random() * Math.floor(keys.length))
        updateAppState(draft => {
          draft.selectedNode = Number(keys[randomIndex])
        })
      }
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [updateAppState, updateAvailable, nodesScanned, selectedNode, genesisCid, rescan])

  useEffect(() => {
    let state = { canceled: false }
    async function run () {
      if (state.canceled) return
      const url = `https://${api}/0/node/rpc/v0`
      const provider = new BrowserProvider(url, { transport: 'http' })
      const client = new LotusRPC(provider, { schema })
      try {
        const {
          Cids: [{ '/': newGenesisCid }]
        } = await client.chainGetGenesis()
        console.log('Genesis CID:', newGenesisCid)
        const updated = newGenesisCid !== genesisCid
        updateAppState(draft => {
          if (draft.genesisCid && draft.genesisCid !== genesisCid) {
            console.log('Old Genesis is different, resetting', draft.genesisCid)
            for (const prop in draft) { delete draft[prop] }
          }
          draft.genesisCid = newGenesisCid
        })
        if (updated) {
          const versionInfo = await client.version()
          console.log('Version Info:', versionInfo)
          const genesisMinerInfo = await client.stateMinerInfo('t01000',[])
          console.log('Genesis Miner Info:', genesisMinerInfo)
          updateAppState(draft => {
            draft.versionInfo = versionInfo
            draft.sectorSize = genesisMinerInfo.SectorSize
          })
        }
      } catch (e) {
        console.warn('Error fetching genesis:', e)
      }
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [updateAppState, genesisCid])
}
