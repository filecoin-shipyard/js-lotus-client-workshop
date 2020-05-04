({ tourState, updateTourState }) => {
  const [status, setStatus] = useState()
  const cid = tourState.cid
  const targetMiner = tourState.targetMiner
  const defaultWalletAddress = tourState.defaultWalletAddress
  const epochPrice = '2500'

  return (
    <div>
      <h3 style={{ margin: '0.5rem' }}>Propose Deal</h3>
      <h5 style={{ marginBottom: 0, marginTop: '0.2rem' }}>CID</h5>
      <div style={{ fontSize: 'small' }}>
        {cid ? cid : <span style={{ color: 'red' }}>Missing</span>}
      </div>
      <h5 style={{ marginBottom: 0, marginTop: '0.2rem' }}>Wallet</h5>
      <div style={{ fontSize: 'small' }}>
        {defaultWalletAddress ? (
          defaultWalletAddress
        ) : (
          <span style={{ color: 'red' }}>Missing</span>
        )}
      </div>
      <h5 style={{ marginBottom: 0, marginTop: '0.2rem' }}>Miner</h5>
      <div style={{ fontSize: 'small' }}>
        {targetMiner ? (
          targetMiner
        ) : (
          <span style={{ color: 'red' }}>Missing</span>
        )}
      </div>
      <h5 style={{ marginBottom: 0, marginTop: '0.2rem' }}>Duration</h5>
      <div style={{ fontSize: 'small' }}>300 blocks (10 minutes)</div>
      <h5 style={{ marginBottom: 0, marginTop: '0.2rem' }}>Epoch Price</h5>
      <div style={{ fontSize: 'small' }}>{epochPrice}</div>
      <button
        onClick={proposeDeal}
        style={{
          width: '10rem',
          minHeight: '2rem',
          fontSize: 'large',
          margin: '1rem'
        }}
      >
        Propose Deal
      </button>
      <div style={{ fontSize: 'small' }}>
        {status}
      </div>
    </div>
  )

  async function proposeDeal () {
    const dataRef = {
      Data: {
        TransferType: 'graphsync',
        Root: {
          '/': cid
        },
        PieceCid: null,
        PieceSize: 0
      },
      Wallet: defaultWalletAddress,
      Miner: targetMiner,
      EpochPrice: epochPrice,
      MinBlocksDuration: 300
    }
    setStatus('Proposing...')
    try {
      const result = await client.clientStartDeal(dataRef)
      const { "/": proposalCid } = result
      setStatus('Proposed: ' + proposalCid)
      updateTourState(draft => {
        draft.proposalCid = proposalCid
        delete draft.deal
      })
    } catch (e) {
      setStatus('Error: ' + e.message)
      console.log('Exception', e)
    }
  }
}
