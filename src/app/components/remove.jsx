import React from 'react'
import styled from 'styled-components'
import Icon from './icon'

const Remove = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  padding: 12px;
  cursor: pointer;
  user-select: none;
`

export default ({ onClick }) => (
  <Remove onClick={onClick}>
    <Icon name={'close'} />
  </Remove>
)
