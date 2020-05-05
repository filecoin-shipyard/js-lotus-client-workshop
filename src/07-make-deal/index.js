import React from 'react'
import CaptureMedia from './capture-media'
import ProposeDeal from './propose-deal'

export default function MakeDeal (props) {
  const { appState } = props

  let content
  if (!appState.capture) {
    content = <CaptureMedia {...props} />
  } else {
    content = <ProposeDeal {...props} />
  }

  return content
}
