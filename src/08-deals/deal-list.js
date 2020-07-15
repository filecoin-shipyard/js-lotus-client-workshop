import React, { useEffect, useState } from 'react'
import { format, formatDistance } from 'date-fns'
import copy from 'clipboard-copy'

const dealStateNames = [
  // go-fil-markets/storagemarket/dealstatus.go
  'Unknown', // 0
  'ProposalNotFound', // 1
  'ProposalRejected', // 2
  'ProposalAccepted', // 3
  'Staged', // 4
  'Sealing', // 5
  'RecordPiece', // 6
  'Active', // 7
  'Expired', // 8
  'Slashed', // 9
  'Rejecting', // 10
  'Failing', // 11
  'FundsEnsured', // 12
  'StorageDealCheckForAcceptance', // 13
  'Validating', // 14
  'AcceptWait', // 15
  'StartDataTransfer', // 16
  'Transferring', // 17
  'WaitingForData', // 18
  'VerifyData', // 19
  'EnsureProviderFunds', // 20
  'EnsureClientFunds', // 21
  'ProviderFunding', // 22
  'ClientFunding', // 23
  'Publish', // 24
  'Publishing', // 25
  'Error' // 26
]

function DealHistory ({ dealHistoryData, height }) {
  if (!dealHistoryData || !height) return null
  const now = Date.now()

  return (
    <table style={{ fontSize: '70%' }}>
      <tbody>
        {dealHistoryData.map((record, i) => {
          return (
            <tr key={i}>
              <td>
                {dealStateNames[record[0]]}
              </td>
              <td>{blocks(i)}</td>
              <td>{timeElapsed(i)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  function blocks (i) {
    const start = dealHistoryData[i][1]
    const end =
      i < dealHistoryData.length - 1 ? dealHistoryData[i + 1][1] : height
    return `${start} (${end - start} blocks)`
  }

  function timeElapsed (i) {
    const start = dealHistoryData[i][2]
    const end = i < dealHistoryData.length - 1 ? dealHistoryData[i + 1][2] : now
    return (
      `${format(start, 'kk:mm:ss')} ` +
      `(${formatDistance(start, end, { includeSeconds: true })})`
    )
  }
}

export default function DealList ({ client, appState, cid }) {
  const [now, setNow] = useState(Date.now())
  const [height, setHeight] = useState()

  useEffect(() => {
    const state = { canceled: false }
    if (!client) return
    async function run () {
      if (state.canceled) return
      const { Height: height } = await client.chainHead()
      if (state.canceled) return
      setHeight(height)
      setNow(Date.now())
      setTimeout(run, 1000)
    }
    run()
    return () => {
      state.canceled = true
    }
  }, [client])

  if (!appState.deals) return null
  const { dealData, dealHistory } = appState

  let deals = cid
    ? appState.deals.filter(deal => deal.cid === cid)
    : [...appState.deals]
  deals.sort(({ date: a }, { date: b }) => b - a)

  return (
    <div>
      {deals.map(deal => {
        const { proposalCid, fromNode, miner, date, cid: cidDeal, type } = deal
        const data = dealData && dealData[proposalCid]
        const clientDealStatus = data && data.clientDealStatus
        const dealState = clientDealStatus && clientDealStatus.State
        const dealMessage = clientDealStatus && clientDealStatus.Message
        const dealHistoryData = dealHistory && dealHistory[proposalCid]
        return (
          <div key={proposalCid} style={{ marginBottom: '1rem' }}>
            <div>
              Node #{fromNode} -> Miner {miner}
            </div>
            <div style={{ fontSize: '50%' }}>
              <div>Date: {new Date(date).toString()}</div>
              <div>Type: {type}</div>
              {!cid && (
                <div>
                  CID: {cidDeal} <button onClick={copyCid}>Copy</button>
                </div>
              )}
              <div>Proposal CID: {proposalCid}</div>
              <div>State: {dealData && dealStateNames[dealState]}</div>
              <div>
                Last update:{' '}
                {data && formatDistance(data.updatedAtTime, now) + ' ago'}
              </div>
              {dealMessage && <div>Message: {dealMessage}</div>}
            </div>
            <DealHistory dealHistoryData={dealHistoryData} height={height} />
          </div>
        )

        async function copyCid () {
          console.log('Copying to clipboard', cidDeal)
          await copy(cidDeal)
          console.log('Copied.')
        }
      })}
    </div>
  )
}
