import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Row } from '../flex'
import Icon from '../icon'
import { colors, css } from '../../theme'

const DropdownContainer = styled.div`
  position: relative;
  user-select: none;
`
const DropdownContainerHover = styled(DropdownContainer)`
  :hover {
    .dropdown-list {
      display: block;
      top: 80%;
    }
  }
`
const DropdownList = styled.div.attrs({ className: 'dropdown-list' })`
  position: absolute;
  right: 0;
  top: 110%;
  border-radius: 3px;
  right: 0;
  ${({ align }) => align === 'right' ? 'transform: translateX(75%);' : ''}
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  background: #fafafa;
  ${css.cardLike}
  user-select: none;
  z-index: 5;
`

const dropdownLinkCss = `
  color: ${colors.font._400};
  padding: 12px 6px;
  display: block;
  text-decoration: none;
  font-size: 12px;
  text-align: left;
  min-width: 115px;
  :hover {
    background: #eaeaea;
  }
`
const DropdownLink = styled(Link)`
  ${dropdownLinkCss}
`
const DropdownLinkExternal = styled.a`
  ${dropdownLinkCss}
`

const Dropdown = ({ links, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false)

  return <DropdownContainer>
    <Icon name={isOpen ? 'arrow_drop_up' : 'arrow_drop_down'} onClick={e => setIsOpen(!isOpen)} color={colors.primary._400} />
    <DropdownList isOpen={isOpen} align={align}>
      {links.map(child => {
        return child.isExternal
          ? <DropdownLinkExternal
            key={child.to}
            href={child.to}
          >{child.label}</DropdownLinkExternal>
          : <DropdownLink
            key={child.to}
            to={child.to}
            onClick={e => setIsOpen(false)}
          >{child.label}</DropdownLink>
      }
      )}
    </DropdownList>
  </DropdownContainer>
}

export const HoverDown = ({ links, children, align = 'left' }) => {
  return <DropdownContainerHover>
    <Row align='center' justify='center' fill={'true'}>
      {children}
      <Icon name={'arrow_drop_down'} color={colors.font._400} />
    </Row>
    <DropdownList align={align}>
      {links.map(child => <DropdownLink
        key={child.to}
        to={child.to}
      >{child.label}</DropdownLink>)}
    </DropdownList>
  </DropdownContainerHover>
}

export default Dropdown
