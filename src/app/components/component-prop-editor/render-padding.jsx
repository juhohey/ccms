import React from 'react'

import Padding from '../style/padding'
import { merge, assoc } from 'ramda'

const renderPadding = ({ style, element, onUpdateProps }) => {
  const padding = {
    top: parseInt(style.paddingTop) || 0,
    right: parseInt(style.paddingRight) || 0,
    bottom: parseInt(style.paddingBottom) || 0,
    left: parseInt(style.paddingLeft) || 0
  }
  const reducePadding = nextPadding => Object.entries(nextPadding).reduce((acc, [key, value]) => {
    switch (key) {
      case 'top':
        return value ? assoc('paddingTop', value + 'px', acc) : acc
      case 'right':
        return value ? assoc('paddingRight', value + 'px', acc) : acc
      case 'bottom':
        return value ? assoc('paddingBottom', value + 'px', acc) : acc
      case 'left':
        return value ? assoc('paddingLeft', value + 'px', acc) : acc
    }
  }, {})

  const setPadding = nextPadding => {
    const paddingsAsAttributes = reducePadding(nextPadding)
    onUpdateProps({ field: 'style', value: merge(style, paddingsAsAttributes) })
  }
  return <Padding padding={padding} setPadding={setPadding} key={element.id} />
}

export default renderPadding
