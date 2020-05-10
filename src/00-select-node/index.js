import React from 'react'

export default function SelectNode ({ appState, updateAppState }) {
  const {
    available,
    selectedNode,
    versionInfo,
    sectorSize,
    testgroundRunId
  } = appState
  const blockDelay = versionInfo && versionInfo.BlockDelay
  const version = versionInfo && versionInfo.Version
  const versionMatch = version && version.match(/git([0-9a-f]+)/)
  const versionUrl =
    versionMatch &&
    `https://github.com/filecoin-project/lotus/commit/${versionMatch[1]}`

  return (
    <div>
      <h2>Available Nodes</h2>
      <button
        style={{ marginBottom: '1rem' }}
        onClick={() => {
          updateAppState(draft => {
            draft.rescan = Date.now()
          })
        }}
      >
        Rescan
      </button>
      <div>
        Which node would you like to be?
        <br />
        <br />
        {available &&
          available.map((miner, i) => (
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
      <h2>Network Info</h2>
      <div>
        <div>
          Version: {versionUrl && <a href={versionUrl}>{version}</a>}
          {!versionUrl && <>{version}</>}
        </div>
        <div>Block Delay: {blockDelay}</div>
        <div>Sector Size: {sectorSize}</div>
        <div>Testground Run ID: {testgroundRunId}</div>
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
