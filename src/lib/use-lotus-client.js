import { useEffect, useState } from 'react'
import LotusRPC from '../lotus-client-rpc'
import BrowserProvider from '../lotus-client-provider-browser'
// import schema from '@filecoin-shipyard/lotus-client-schema/prototype/testnet-v3'
import schema from '../lotus-client-schema-testnet-v3'

export default function useLotusClient (nodeNumber, nodeOrMiner) {
  const [client, setClient] = useState()

  useEffect(() => {
    const api = 'lotus.testground.ipfs.team/api'
    const wsUrl = 'wss://' + api + `/${nodeNumber}/${nodeOrMiner}/rpc/v0`
    const provider = new BrowserProvider(wsUrl, {
      token: async () => {
        const tokenUrl = 'https://' + api + `/${nodeNumber}/testplan/` +
          (nodeOrMiner === 'node' ? '.lotus' : '.lotusstorage') + '/token'
        const response = await fetch(tokenUrl)
        return await response.text()
      }
    })
    const client = new LotusRPC(provider, { schema })
    setClient(client)
    return () => {
      client.destroy()
    }
  }, [nodeNumber, nodeOrMiner])

  return client
}