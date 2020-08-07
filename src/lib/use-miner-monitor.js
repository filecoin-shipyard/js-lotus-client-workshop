import { useEffect, useState, useMemo } from 'react'
import { useImmer } from 'use-immer'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { BrowserProvider } from '@filecoin-shipyard/lotus-client-provider-browser'
import { testnet } from '@filecoin-shipyard/lotus-client-schema'

const interval = 5000

export default function useMinerMonitor ({ appState, updateAppState }) {
  const { nodesScanned, miners, available } = appState
  useEffect(() => {
    console.log('Jim miner monitor', nodesScanned, miners, available)
    const state = {
      ticking: true
    }
    const clients = []
    for (let i in available) {
      if (!available[i]) continue
      console.log('Client setup', i, miners[i])
      const api = 'lotus.testground.ipfs.team/api'
      const wsUrl = 'wss://' + api + `/${i}/miner/rpc/v0`
      const provider = new BrowserProvider(wsUrl, {
        token: async () => {
          const tokenUrl = 'https://' + api + `/${i}/testplan/.lotusminer/token`
          const response = await fetch(tokenUrl)
          return await response.text()
        }
      })
      clients[i] = new LotusRPC(provider, { schema: testnet.storageMiner })
    }
    async function runTick () {
      if (!state.ticking) {
        for (const client of clients) {
          if (client) {
            await client.destroy()
          }
        }
        return
      }
      console.log('Miner monitor tick')
      for (let i in available) {
        if (!available[i]) continue
        const client = clients[i]
        const miner = miners[i]
        if (!client) continue
        console.log('Check', i, miner)
        const sectors = await client.sectorsList()
        console.log('Sectors', sectors)
        /* from node
        const activeSectors = await client.stateMinerActiveSectors(miner)
        console.log('Active Sectors', activeSectors)
        */
        for (const sector of sectors) {
          const sectorsStatus = await client.sectorsStatus(sector, false)
          console.log('Sectors Status', sector, sectorsStatus)
        }
        const retrievalDeals = await client.marketListRetrievalDeals()
        console.log('Retrieval Deals', retrievalDeals)
      }
      setTimeout(runTick, interval)
    }
    runTick()
    return () => {
      state.ticking = false
    }
  }, [nodesScanned, miners, available])
}
