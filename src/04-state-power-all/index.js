import React, { useEffect, useState } from 'react'
import useLotusClient from '../lib/use-lotus-client'

export default function StatePowerAll ({ appState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  const [totalPower, setTotalPower] = useState()

  useEffect(() => {
    if (!client) return
    setTotalPower('Loading...')
    ;(async function run () {
      const result = await client.stateMinerPower('<empty>', [])
      setTotalPower(result.TotalPower)
    })()
  }, [client])

  let content
  if (!totalPower) {
    content = <div>Loading...</div>
  } else {
    content = (
      <div>
        <h3>RawBytePower: {totalPower.RawBytePower} bytes</h3>
        <h3>QualityAdjPower: {totalPower.QualityAdjPower} bytes</h3>
      </div>
    )
  }
  return (
    <div>
      <h2>StateMinerPower</h2>
      <div>
      (Total Network Power)
      </div>
      {content}
      (using Node #{selectedNode})
    </div>
  )
}
