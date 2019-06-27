import React from 'react'

const Icon = ({ name, style, color, size = '24px', ...rest }) => {
  const styleActual = style || { color: color, fontSize: size }
  return <i className={'material-icons'} style={styleActual} {...rest}>{name}</i>
}
export default Icon
