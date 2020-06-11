import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import ErrorBoundary from './error-boundary.js'
import { useImmer } from 'use-immer'
import produce from 'immer'
import useTestgroundNet from './lib/use-testground-net'
import useDealMonitor from './lib/use-deal-monitor'
import SelectNode from './00-select-node'
import ChainHeight from './01-chain-height'
import MinerAddress from './02-miner-address'
import ChainNotify from './03-chain-notify'
import StatePowerAll from './04-state-power-all'
import StateListMiners from './05-state-list-miners'
import StatePowerMiners from './06-state-power-miners'
import Camera from './07-camera'
import Deals from './08-deals'
import Retrieve from './09-retrieve'
import Home from './home'
import './index.css'

let initialState
const initialStateJson = localStorage.getItem('state')
try {
  initialState = JSON.parse(initialStateJson) || {}
  if (Object.keys(initialState).length === 0) {
    localStorage.setItem('state', '{}')
  }
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
      if (!localStorage.getItem('state')) {
        // User deleted state in browser localStorage
        return
      }
      localStorage.setItem('state', jsonStateToSave)
      setSavedState(jsonStateToSave)
    }
  }, [appState, savedState, setSavedState])

  useDealMonitor({ appState, updateAppState })

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
          <Link to='/miners'>Miners</Link>
        </nav>
        <nav style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Link to='/camera'>Store: Camera</Link>
          <Link to='/retrieve'>Retrieve</Link>
          <Link to='/deals'>My Deals</Link>
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
            <Route path='/camera'>
              <Camera {...baseProps} />
            </Route>
            <Route path='/ipfs'>
              <IPFS {...baseProps} />
            </Route>
            <Route path='/miners'>
              <Miners {...baseProps} />
            </Route>
            <Route path='/store'>
              <Store {...baseProps} />
            </Route>
            <Route path='/upload'>
              <Upload {...baseProps} />
            </Route>
            <Route path='/retrieve/:cid?'>
              <Retrieve {...baseProps} />
            </Route>
            <Route path='/examples'>
              <Examples {...baseProps} />
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

function Upload () {
  return <h1>Upload a File</h1>
}

function Store () {
  return (
    <div>
      <h1>Store</h1>
      <ul>
        <li>
          <Link to='/camera'>From Camera</Link>
        </li>
        <li>
          <Link to='/upload'>Upload File</Link>
        </li>
        <li>
          <Link to='/ipfs'>From IPFS</Link>
        </li>
      </ul>
    </div>
  )
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

function Examples () {
  return (
    <div>
      <h1>Code Examples</h1>
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

ReactDOM.render(<App />, document.getElementById('root'))
