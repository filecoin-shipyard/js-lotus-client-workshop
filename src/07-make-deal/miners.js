({ tourState, updateTourState }) => {
  const miners = useMiners(clientNode)
  const myMiner = useActorAddress(clientMiner)
  const targetMiner = tourState.targetMiner

  let content
  if (!myMiner || !miners) {
    content = <div>Loading...</div>
  } else {
    content = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div>Select one to propose a deal with:</div>
        <div style={{ textAlign: 'left', marginTop: '1rem', fontSize: '60%' }}>
          {miners
            .filter(miner => miner !== myMiner)
            .map(miner => (
              <div key={miner}>
                <input
                  type='radio'
                  name='miner'
                  value={miner}
                  checked={miner === targetMiner}
                  onChange={changed}
                />
                {miner}
              </div>
            ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <h3>Available Miners</h3>
      {content}
    </div>
  )

  function changed (evt) {
    const targetMiner = evt.currentTarget.value
    updateTourState(draft => { draft.targetMiner = targetMiner })
  }
}
