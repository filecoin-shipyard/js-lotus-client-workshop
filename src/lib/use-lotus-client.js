import { useEffect, useState } from 'react'
import { LotusRPC } from '@filecoin-shipyard/lotus-client-rpc'
import { BrowserProvider } from '@filecoin-shipyard/lotus-client-provider-browser'
import { testnet } from '@filecoin-shipyard/lotus-client-schema'

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
    const client = new LotusRPC(provider, { schema: testnet.fullNode })
    setClient(client)
    return () => {
      client.destroy()
    }
  }, [nodeNumber, nodeOrMiner])

  return client
}