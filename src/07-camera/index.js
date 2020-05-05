import React from 'react'
import CaptureMedia from './capture-media'
import ProposeDeal from './propose-deal'

export default function MakeDeal (props) {
  const { appState } = props
  const { capture, importedNode, selectedNode } = appState

  let content
  if (capture && importedNode === selectedNode) {
    content = <ProposeDeal {...props} />
  } else {
    content = <CaptureMedia {...props} />
  }

  return content
}
