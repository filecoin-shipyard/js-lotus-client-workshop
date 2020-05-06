import React from 'react'
import DealList from './deal-list'
import useLotusClient from '../lib/use-lotus-client'

export default function Deals ({ appState, updateAppState }) {
  const { deals, selectedNode } = appState
  const client = useLotusClient(selectedNode, 'node')
  return (
    <div>
      <h1>Deals</h1>
      {deals && deals.length > 0 && (
        <button
          style={{ height: '2rem', marginBottom: '1rem' }}
          onClick={clearAll}
        >
          Clear
        </button>
      )}
      <DealList client={client} appState={appState} />
    </div>
  )

  function clearAll () {
    updateAppState(draft => {
      draft.deals = []
      draft.dealData = {}
      draft.dealHistory = {}
    })
  }
}
