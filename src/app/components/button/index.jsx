import styled from 'styled-components'
import { colors } from '../../theme'

export const Actions = styled.div`
  display: flex;
  margin-left: auto;
  margin-top: 16px;
  justify-content: flex-end;
  button {
    margin-left: 12px;
  }
`
export const ActionsFirst = styled.div`
  margin-right: auto;
`

const Button = styled.button`
 ${({ action }) => {
    switch (action) {
      case 'save':
      case 'confirm':
        return `
        background-color: ${colors.lightBlue._400};
      `
      case 'delete':
      case 'attention':
        return `
        color: white;
        background-color: ${colors.pink._400};
      `
      default:
        return `
        color: ${colors.font._400};
        background-color: #fafafa;
    `
    }
  }};
  border-radius: 3px;
  &[disabled] {
    background-color: #eee;
    color: ${colors.font._300};
    cursor: not-allowed;
  }
`

export default Button
