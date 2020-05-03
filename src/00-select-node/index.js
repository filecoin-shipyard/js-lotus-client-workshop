import React, { useEffect, useState } from 'react'

export default function SelectNode () {
  const [nodeCount, setNodeCount] = useState()

  useEffect(() => {
    let state = { canceled: false }
    setNodeCount('Loading...')
    async function run() {
      if (state.canceled) return
      const api = 'lotus.testground.ipfs.team/api'
      const paramsUrl = 'https://' + api + `/0/testplan/params`
      const response = await fetch(paramsUrl)
      const { TestInstanceCount: nodeCount } = await response.json()
      if (state.canceled) return
      setNodeCount(nodeCount)
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [])

  return (
    <div>
      <h2>Number of Nodes</h2>
      <h1>{nodeCount}</h1>
    </div>
  )
}
