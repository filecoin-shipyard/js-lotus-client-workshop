import React, { useEffect, useState } from 'react'
import useLotusClient from '../lib/use-lotus-client'

export default function ListMiners ({ appState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  const [miners, setMiners] = useState()

  useEffect(() => {
    if (!client) return
    ;(async function run () {
      const result = await client.stateListMiners([])
      setMiners(result.sort())
    })()
  }, [client])

  let content
  if (!miners) {
    content = 'Loading...'
  } else {
    content = (
      <ul style={{ textAlign: 'left' }}>
        {miners.map(miner => (
          <li key={miner}>{miner}</li>
        ))}
      </ul>
    )
  }
  return (
    <div>
      <h2>StateListMiners</h2>
      <div>(using Node #{selectedNode})</div>
      {content}
    </div>
  )
}
