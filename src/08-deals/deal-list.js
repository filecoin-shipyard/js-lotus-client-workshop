import React from 'react'

export default function DealList ({ appState, cid }) {
  if (!appState.deals) return null

  let deals = cid
    ? appState.deals.filter(deal => deal.cid === cid)
    : [...appState.deals]
  deals.sort(({ date: a }, { date: b }) => b - a)

  return (
    <div>
      {deals.map(deal => (
        <div>
          #{deal.fromNode} -> {deal.miner} <br />
          <div style={{ fontSize: '50%' }}>
            Date: {new Date(deal.date).toString()} <br />
            CID: {deal.cid} <br />
            Proposal CID: {deal.proposalCid} <br />
            Type: {deal.type}
          </div>
        </div>
      ))}
    </div>
  )
}
