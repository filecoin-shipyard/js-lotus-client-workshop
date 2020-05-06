import React from 'react'
import { Link } from 'react-router-dom'

export default function Home () {
  return (
    <div>
      <h2>Home</h2>
      <p>
        Welcome to the Ready Layer One "Build a JS web app for Filecoin Lotus"
        workshop!
      </p>
      <p>
        This example web app connects to a short-lived Filecoin** development
        network, running 12 nodes + miners specifically for this workshop.
      </p>
      <p>
        GitHub:{' '}
        <a href='https://github.com/filecoin-shipyard/rl1-lotus-workshop'>
          filecoin-shipyard/rl1-lotus-workshop
        </a>
      </p>
      <p>
        <b>**Disclaimer**</b> The network is running untested, development
        code with 2048 byte sectors. It is not representative of production. You
        may encounter some known bugs and configuration issues that won't be
        present in the upcoming testnet and mainnet networks. The network that
        is used for this workshop will change and may disappear after the
        workshop, but we will not be keeping this code updated to match.
      </p>
      <p>
        Looking for <Link to="/examples">simpler code examples</Link>?
      </p>
    </div>
  )
}
