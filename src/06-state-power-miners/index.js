import React, { useEffect } from 'react'
import { useImmer } from 'use-immer'
import useLotusClient from '../lib/use-lotus-client'
import useMiners from '../lib/use-miners'

export default function StatePowerMiners ({ appState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  const miners = useMiners(client)
  const [minerPower, updateMinerPower] = useImmer({})

  useEffect(() => {
    let state = { canceled: false }
    if (!miners) return
    ;(async function run () {
      if (state.canceled) return
      for (const miner of miners) {
        const result = await client.stateMinerPower(miner, [])
        if (state.canceled) return
        updateMinerPower(draft => {
          draft[miner] = result.MinerPower
          draft['total'] = result.TotalPower
        })
      }
    })()
    return () => {
      state.canceled = true
    }
  }, [client, miners, updateMinerPower])

  return (
    <div>
      <ul>
        {miners &&
          miners.map(miner => (
            <li key={miner}>
              {miner}: {minerPower[miner] && minerPower[miner].QualityAdjPower}
            </li>
          ))}
      </ul>
    </div>
  )
}
