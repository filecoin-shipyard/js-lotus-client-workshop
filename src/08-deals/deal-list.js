import React from 'react'

const dealStateNames = [
  // go-fil-markets/storagemarket/types.go
  'StorageDealUnknown', // 0
  'StorageDealProposalNotFound', // 1
  'StorageDealProposalRejected', // 2
  'StorageDealProposalAccepted', // 3
  'StorageDealStaged', // 4
  'StorageDealSealing', // 5
  'StorageDealActive', // 6
  'StorageDealFailing', // 7
  'StorageDealNotFound', // 8

  'StorageDealFundsEnsured', // 9
  'StorageDealValidating', // 10
  'StorageDealTransferring', // 11
  'StorageDealWaitingForData', // 12
  'StorageDealVerifyData', // 13
  'StorageDealPublishing', // 14
  'StorageDealError', // 15
  'StorageDealCompleted' // 16
]

export default function DealList ({ appState, cid }) {
  if (!appState.deals) return null
  const { dealStates } = appState

  let deals = cid
    ? appState.deals.filter(deal => deal.cid === cid)
    : [...appState.deals]
  deals.sort(({ date: a }, { date: b }) => b - a)

  return (
    <div>
      {deals.map(deal => {
        const { proposalCid, fromNode, miner, date, cid: cidDeal, type } = deal
        const dealState =
          dealStates && dealStates[proposalCid] && dealStates[proposalCid].State
        const dealMessage =
          dealStates && dealStates[proposalCid] && dealStates[proposalCid].Message
        return (
          <div key={proposalCid}>
            #{fromNode} -> {miner} <br />
            <div style={{ fontSize: '50%' }}>
              Date: {new Date(date).toString()} <br />
              {!cid && <>CID: {cidDeal} <br /></>}
              Proposal CID: {proposalCid} <br />
              Type: {type} <br />
              State: {dealStates && dealStateNames[dealState]} <br />
              Message: {dealMessage}
            </div>
          </div>
        )
      })}
    </div>
  )
}
