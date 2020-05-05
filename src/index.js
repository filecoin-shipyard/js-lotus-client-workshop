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
import Home from './home'
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
  const { selectedNode } = appState

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
        <nav style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Link to='/'>Home</Link>
          <Link to='/select-node'>Node: #{selectedNode}</Link>
          <Link to='/chain-notify'>Chain</Link>
          <Link to='/deals'>Deals</Link>
          <Link to='/make-deal'>Camera</Link>
          <Link to='/ipfs'>IPFS</Link>
          <Link to='/miners'>Miners</Link>
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
            <Route path='/deals'>
              <Deals {...baseProps} />
            </Route>
            <Route path='/make-deal'>
              <MakeDeal {...baseProps} />
            </Route>
            <Route path='/ipfs'>
              <IPFS {...baseProps} />
            </Route>
            <Route path='/miners'>
              <Miners {...baseProps} />
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

function IPFS () {
  return <h1>IPFS</h1>
}

function Deals () {
  return <h1>Deals</h1>
}

function Miners (props) {
  return (
    <div>
      <h1>Miners</h1>
      <StatePowerAll {...props} />
      <StatePowerMiners {...props} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
