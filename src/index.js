import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import ErrorBoundary from './error-boundary.js'
import { useImmer } from 'use-immer'
import produce from 'immer'
import useTestgroundNet from './lib/use-testground-net'
import SelectNode from './00-select-node'
import ChainHeight from './01-chain-height'
import MinerAddress from './02-miner-address'
import ChainNotify from './03-chain-notify'
import StatePowerAll from './04-state-power-all'
import StateListMiners from './05-state-list-miners'
import StatePowerMiners from './06-state-power-miners'
import MakeDeal from './07-make-deal'
import './index.css'

let initialState
const initialStateJson = localStorage.getItem('state')
try {
  initialState = JSON.parse(initialStateJson) || {}
} catch (e) {
  initialState = {}
}

function App () {
  const [appState, updateAppState] = useImmer(initialState)
  const [savedState, setSavedState] = useState()
  useTestgroundNet({ appState, updateAppState })

  useEffect(() => {
    const stateToSave = produce(appState, draft => {
      delete draft.capture
      delete draft.stream
    })
    const jsonStateToSave = JSON.stringify(stateToSave)
    if (jsonStateToSave !== savedState) {
      localStorage.setItem('state', jsonStateToSave)
      setSavedState(jsonStateToSave)
    }
  }, [appState, savedState, setSavedState])

  const baseProps = {
    appState,
    updateAppState
  }

  return (
    <Router>
      <div>
        <nav style={{ display: 'flex' }}>
          <Link to='/'>Home</Link>
          <Link to='/select-node'>Select Node</Link>
          <Link to='/chain-height'>Chain Height</Link>
          <Link to='/miner-address'>Miner Address</Link>
          <Link to='/chain-notify'>Chain Notify</Link>
          <Link to='/state-power-all'>Power: All</Link>
          <Link to='/state-list-miners'>List Miners</Link>
          <Link to='/state-power-miners'>Power: Miners</Link>
          <Link to='/make-deal'>Make a Deal</Link>
        </nav>
        <ErrorBoundary>
          <Switch>
            <Route path='/select-node'>
              <SelectNode {...baseProps} />
            </Route>
            <Route path='/chain-height'>
              <ChainHeight {...baseProps} />
            </Route>
            <Route path='/miner-address'>
              <MinerAddress {...baseProps} />
            </Route>
            <Route path='/chain-notify'>
              <ChainNotify {...baseProps} />
            </Route>
            <Route path='/state-power-all'>
              <StatePowerAll {...baseProps} />
            </Route>
            <Route path='/state-list-miners'>
              <StateListMiners {...baseProps} />
            </Route>
            <Route path='/state-power-miners'>
              <StatePowerMiners {...baseProps} />
            </Route>
            <Route path='/make-deal'>
              <MakeDeal {...baseProps} />
            </Route>
            <Route path='/'>
              <Home />
            </Route>
          </Switch>
        </ErrorBoundary>
      </div>
    </Router>
  )
}

function Home () {
  return <h2>Home</h2>
}

ReactDOM.render(<App />, document.getElementById('root'))
