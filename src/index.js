import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import useLotusClient from './use-lotus-client'

function App() {
  const client = useLotusClient(0, 'node')
  const [height, setHeight] = useState()

  useEffect(() => {
    let state = { canceled: false }
    if (!client) return
    setHeight('Loading...')
    async function run() {
      if (state.canceled) return
      const result = await client.chainHead()
      if (state.canceled) return
      setHeight(result.Height)
      setTimeout(run, 1000)
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [client])

  return (
    <div>
      <h2>Height</h2>
      <h1>{height}</h1>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
