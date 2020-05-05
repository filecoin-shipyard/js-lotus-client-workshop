import React from 'react'
// import useTestgroundNet from '../lib/use-testground-net'

export default function SelectNode ({ appState, updateAppState }) {
  // useTestgroundNet({ appState, updateAppState })
  const { available, selectedNode } = appState

  return (
    <div>
      <h2>Available Nodes</h2>
      <div>
        {available && available.map((miner, i) => (
          <div key={i}>
            <input
              type='radio'
              name='node'
              value={i}
              checked={i === selectedNode}
              onChange={selectNode}
            />
            #{i}
          </div>
        ))}
      </div>
    </div>
  )

  function selectNode (evt) {
    const selectedNode = Number(evt.currentTarget.value)
    updateAppState(draft => {
      draft.selectedNode = selectedNode
    })
  }
}
