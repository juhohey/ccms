import React from 'react'
import styled from 'styled-components'
import { colors, bgs } from '../../theme'

const LoaderElement = styled.aside`
  height: 20px;
  width: 20px;
  ${bgs.gradient}
  background-color: ${colors.lightBlue._400};
  border-radius: 2%;
  -webkit-animation: spin 2s infinite;
  animation: spin 2s infinite;

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  90%, 100% {
    transform: rotate(540deg);
  }
}
`
const Loader = () => {
  return <LoaderElement />
}
export default Loader
