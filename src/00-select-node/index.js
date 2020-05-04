import React from 'react'
// import useTestgroundNet from '../lib/use-testground-net'

export default function SelectNode ({ appState, updateAppState }) {
  // useTestgroundNet({ appState, updateAppState })
  const { available, selectedNode } = appState

  return (
    <div>
      <h2>Select Node</h2>
      <div>
        Here are all the available miners. Pick any one you like:<br /><br />
        {available && available.map((miner, i) => (
          <div key={i}>
            <input
              type='radio'
              name='node'
              value={i}
              checked={i === selectedNode}
              onChange={selectNode}
            />
            #{i}: {miner}
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
