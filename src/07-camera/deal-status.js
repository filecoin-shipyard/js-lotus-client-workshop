({ tourState, updateTourState }) => {
  const [height, setHeight] = useState()
  const proposalCid = tourState.proposalCid
  const deal = tourState.deal
  const marketDeal = tourState.marketDeal

  const dealStates = [ // go-fil-markets/storagemarket/types.go
    "StorageDealUnknown", // 0
    "StorageDealProposalNotFound", // 1
    "StorageDealProposalRejected", // 2
    "StorageDealProposalAccepted", // 3
    "StorageDealStaged", // 4
    "StorageDealSealing", // 5
    "StorageDealActive", // 6
    "StorageDealFailing", // 7
    "StorageDealNotFound", // 8

    "StorageDealFundsEnsured", // 9
    "StorageDealValidating", // 10
    "StorageDealTransferring", // 11
    "StorageDealWaitingForData", // 12
    "StorageDealVerifyData", // 13
    "StorageDealPublishing", // 14
    "StorageDealError", // 15
    "StorageDealCompleted" // 16
  ]
  useEffect(() => {
    let state = { canceled: false }
    if (tourState.index !== slideIndex) return
    if (!proposalCid) return
    ;(async function run () {
      if (state.canceled) return
      const deals = await client.clientListDeals()
      if (state.canceled) return
      const matchedDeal = deals.find(
        ({ ProposalCid: { '/': propCid } }) => propCid === proposalCid
      )
      if (matchedDeal) {
        console.log('ClientListDeals', matchedDeal)
        updateTourState(draft => {
          draft.deal = matchedDeal
        })
      }
      setTimeout(run, 1000)
    })()
    return () => {
      state.canceled = true
    }
  }, [tourState.index, proposalCid])

  useEffect(() => {
    let state = { canceled: false }
    if (tourState.index !== slideIndex) return
    if (!deal) return
    ;(async function run () {
      if (state.canceled) return
      const dealDetail = await client.stateMarketStorageDeal(deal.DealID, [])
      console.log('StateMarketStorageDeal', dealDetail)
      updateTourState(draft => {
        draft.marketDeal = dealDetail
      })
      setTimeout(run, 1000)
    })()
    return () => {
      state.canceled = true
    }
  }, [tourState.index, deal])

  useEffect(() => {
    let state = { canceled: false }
    if (tourState.index !== slideIndex) return
    setHeight('Loading...')
    ;(async function run () {
      if (state.canceled) return
      const result = await client.chainHead()
      if (state.canceled) return
      setHeight(result.Height)
      setTimeout(run, 1000)
    })()
    return () => { state.canceled = true }
  }, [tourState.index])

  let content
  if (!deal || !marketDeal) {
    content = <div>Loading...</div>
  } else {
    content = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: '50%',
          margin: '3rem'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div>Deal ID: {deal.DealID}</div>
          <div>Provider: {deal.Provider}</div>
          <div>State: {dealStates[deal.State]}</div>
          <div>Duration: {deal.Duration}</div>
          <div>Start Epoch: {marketDeal.Proposal.StartEpoch}</div>
          <div>End Epoch: {marketDeal.Proposal.EndEpoch}</div>
          <div>Current Height: {height}</div>
          <div>Message:</div>
          <div style={{ fontSize: 'small' }}>{deal.Message}</div>
        </div>
      </div>
    )
  }
  return (
    <div>
      <h3>Deal Status</h3>
      <div style={{ fontSize: 'small' }}>Proposal CID: {proposalCid}</div>
      {content}
    </div>
  )
}
