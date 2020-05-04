({ tourState, updateTourState }) => {
  const [balance, setBalance] = useState()
  const defaultWalletAddress = tourState.defaultWalletAddress

  useEffect(() => {
    let state = { canceled: false }
    if (tourState.index !== slideIndex) return
    ;(async function run () {
      if (state.canceled) return
      const defaultWalletAddress = await client.walletDefaultAddress()
      if (state.canceled) return
      updateTourState(draft => {
        draft.defaultWalletAddress = defaultWalletAddress
      })
      const balance = await client.walletBalance(defaultWalletAddress)
      setBalance(new FilecoinNumber(balance, 'attofil'))
    })()
    return () => {
      state.canceled = true
    }
  }, [tourState.index])

  if (!defaultWalletAddress) return <div>Loading...</div>

  return (
    <div>
      <h2>WalletDefaultAddress</h2>
      <div style={{ fontSize: 'small' }}>{defaultWalletAddress}</div>
      <h2>WalletBalance</h2>
      {typeof balance !== 'undefined' && balance.toFil()}
    </div>
  )
}
