import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import ErrorBoundary from './error-boundary.js'
import SelectNode from './00-select-node'
import ChainHeight from './01-chain-height'

function Home () {
  return <h2>Home</h2>
}

function App () {
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
                <SelectNode />
              </Route>
              <Route path='/chain-height'>
                <ChainHeight />
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

const rootEl = document.getElementById('root')
ReactDOM.createRoot(rootEl).render(<App />)
