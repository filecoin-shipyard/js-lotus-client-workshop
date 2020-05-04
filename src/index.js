import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import ErrorBoundary from './error-boundary.js'
import { useImmer } from 'use-immer'
import produce from 'immer'
import SelectNode from './00-select-node'
import ChainHeight from './01-chain-height'

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

  useEffect(() => {
    const stateToSave = produce(appState, draft => {
      delete draft.ticker
    })
    if (stateToSave !== savedState) {
      localStorage.setItem('state', JSON.stringify(stateToSave))
      setSavedState(stateToSave)
    }
  }, [appState, savedState, setSavedState])

  useEffect(() => {
    let ticker = 0
    function tick () {
      updateAppState(draft => { draft.ticker = ticker++ })
      setTimeout(tick, 1000)
    }
    tick()
  }, [updateAppState])

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
        </ul>
          <ErrorBoundary>
            <Switch>
              <Route path='/select-node'>
                <SelectNode {...baseProps} />
              </Route>
              <Route path='/chain-height'>
                <ChainHeight {...baseProps} />
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

const rootEl = document.getElementById('root')
ReactDOM.createRoot(rootEl).render(<App />)
