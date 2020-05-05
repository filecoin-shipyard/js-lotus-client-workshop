import React from 'react'
import { Link } from 'react-router-dom'

export default function Home () {
  return (
    <div>
      <h2>Home</h2>

      <ul>
        <li>
          <Link to='/chain-height'>Chain Height</Link>
        </li>
        <li>
          <Link to='/miner-address'>Miner Address</Link>
        </li>
        <li>
          <Link to='/chain-notify'>Chain Notify</Link>
        </li>
        <li>
          <Link to='/state-power-all'>Power: All</Link>
        </li>
        <li>
          <Link to='/state-list-miners'>List Miners</Link>
        </li>
        <li>
          <Link to='/state-power-miners'>Power: Miners</Link>
        </li>
      </ul>

    </div>
  )
}
