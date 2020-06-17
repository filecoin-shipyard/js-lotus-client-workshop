import React, { useEffect, useState } from 'react'
import { format, formatDistance } from 'date-fns'
import copy from 'clipboard-copy'

const dealStateNames = [
  // go-fil-markets/storagemarket/types.go
  'Unknown', // 0
  'ProposalNotFound', // 1
  'ProposalRejected', // 2
  'ProposalAccepted', // 3
  'Staged', // 4
  'Sealing', // 5
  'Active', // 6
  'Failing', // 7
  'NotFound', // 8

  // Internal
  'FundsEnsured', // 9 Deposited funds as neccesary to create a deal, ready to move forward
  'WaitingForDataRequest', // 10 Client is waiting for a request for the deal data
  'Validating', // 11 Verifying that deal parameters are good
  'AcceptWait', // 12 Deciding whether or not to accept the deal
  'Transferring', // 13 Moving data
  'WaitingForData', // 14 Manual transfer
  'VerifyData', // 15 Verify transferred data - generate CAR / piece data
  'EnsureProviderFunds', // 16 Ensuring that provider collateral is sufficient
  'EnsureClientFunds', // 17 Ensuring that client funds are sufficient
  'ProviderFunding', // 18 Waiting for funds to appear in Provider balance
  'ClientFunding', // 19 Waiting for funds to appear in Client balance
  'Publish', // 20 Publishing deal to chain
  'Publishing', // 21 Waiting for deal to appear on chain
  'Error', // 22 deal failed with an unexpected error
  'Completed' // 23 on provider side, indicates deal is active and info for retrieval is recorded
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
