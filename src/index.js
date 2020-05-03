import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import ChainHeight from './01-chain-head'

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
            <Link to='/chain-height'>Chain Height</Link>
          </li>
        </ul>
        <Switch>
          <Route path='/chain-height'>
            <ChainHeight />
          </Route>
          <Route path='/'>
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
