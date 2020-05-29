import React from 'react'
import { Link } from 'react-router-dom'

export default function Home () {
  return (
    <div>
      <h2>Home</h2>
      <p>
        Welcome to the Filecoin "Lotus JS Client" workshop!
      </p>
      <p>
        This example web app connects to a short-lived Filecoin** development
        network, running 6 nodes + miners specifically for this workshop.
      </p>
      <p>
        GitHub:{' '}
        <a href='https://github.com/filecoin-shipyard/js-lotus-rpc-workshop'>
          filecoin-shipyard/js-lotus-rpc-workshop
        </a>
      </p>
      <p>
        <b>**Disclaimer**</b> The network is running bleeding-edge, untested,
        development code with 8MiB sectors. It is not representative of
        production. You may encounter many known bugs and configuration issues that won't be present
        in the upcoming mainnet network. The network that is used
        for this workshop will soon disappear. We will not be keeping this code
        updated.
      </p>
      <p>
        Looking for <Link to='/examples'>simpler code examples</Link>?
      </p>
    </div>
  )
}
