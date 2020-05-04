import React, { useEffect, useState } from 'react'
import useLotusClient from '../lib/use-lotus-client'

export default function MinerAddress ({ appState }) {
  const { selectedNode } = appState
  const client = useLotusClient(selectedNode, 'miner')
  const [address, setAddress] = useState()

  useEffect(() => {
    if (!client) return
    setAddress('Loading...')
    async function run() {
      const address = await client.actorAddress()
      setAddress(address)
    }
    run()
  }, [client])

  return (
    <div>
      <h2>Miner: ActorAddress</h2>
      Now, let's fetch the miner address:
      <h1>{address}</h1>
      (using Node #{selectedNode})
    </div>
  )
}
