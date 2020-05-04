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
      delete draft.ticker
    })
    if (stateToSave !== savedState) {
      localStorage.setItem('state', JSON.stringify(stateToSave))
      setSavedState(stateToSave)
    }
  }, [appState, savedState, setSavedState])

  const baseProps = {
    appState,
    updateAppState
  }

  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/select-node'>Select Node</Link>
          </li>
          <li>
            <Link to='/chain-height'>Chain Height</Link>
          </li>
          <li>
            <Link to='/miner-address'>Miner Address</Link>
          </li>
        </ul>
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
