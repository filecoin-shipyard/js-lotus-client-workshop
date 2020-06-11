import { useEffect, useState } from 'react'
import { FilecoinNumber } from '@openworklabs/filecoin-number'

export default function useWatchDefaultWallet({client, updateAppState}) {
  const [balance, setBalance] = useState()

  useEffect(() => {
    let state = { canceled: false }
    if (!client) return
    ;(async function run () {
      if (state.canceled) return
      const defaultWalletAddress = await client.walletDefaultAddress()
      if (state.canceled) return
      updateAppState(draft => {
        draft.defaultWalletAddress = defaultWalletAddress
      })
      const balance = await client.walletBalance(defaultWalletAddress)
      if (state.canceled) return
      setBalance(new FilecoinNumber(balance, 'attofil'))
      setTimeout(run, 1000)
    })()
    return () => {
      state.canceled = true
    }
  }, [client, updateAppState])

  return balance
}