import { css as styledCss } from 'styled-components'

const pink = {
  _400: '#E91E63',
  _500: '#D81B60',
  _600: '#C2185B'
}
const lightBlue = {
  _400: '#03A9F4'
}
const red = {
  _400: '#F44336'
}

export const colors = {
  primary: pink,
  secondary: lightBlue,
  red,
  pink,
  lightBlue,
  font: {
    _300: '#555',
    _400: '#444',
    _500: '#333'
  }
}

const focused = styledCss`
 border: 2px solid ${colors.lightBlue._400}
`
const cardLike = styledCss`
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  border-radius: 3px;
`

export const css = {
  cardLike,
  focused
}

export const bgs = {
  gradient: 'background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);'
}
