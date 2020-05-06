import React from 'react'
import DealList from './deal-list'

export default function Deals ({ appState }) {
  return (
    <div>
      <h1>Deals</h1>
      <DealList appState={appState} />
    </div>
  )
}

