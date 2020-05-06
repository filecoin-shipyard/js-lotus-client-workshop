import React from 'react'
import DealList from './deal-list'

export default function Deals ({ appState, updateAppState }) {
  const { deals } = appState
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
      <DealList appState={appState} />
    </div>
  )

  function clearAll () {
    updateAppState(draft => {
      draft.deals = []
      draft.dealStates = {}
    })
  }
}
