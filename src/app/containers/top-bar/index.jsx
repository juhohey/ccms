import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { Row, Flex } from '../../components/flex'
import { colors } from '../../theme'
import Icon from '../../components/icon'
import Dropdown, { HoverDown } from '../../components/dropdown'
import { connect } from 'react-redux'
import { makeSiteLink } from '../../../utils/site'

const Header = styled.div`
  background: #fafafa;
  border-bottom: 1px solid #eaeaea;
  height: 80px;
  padding: 0 32px;
`
const HeaderRow = styled(Row)`
  height: 100%;
`
const HeaderLink = styled(NavLink)`
  padding: 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: ${colors.font._400};
  text-decoration: none;
  &:hover {
    color: ${colors.primary._400};
  }
  &.active {
    color: ${colors.primary._400};
  }
`
const UserMenuLink = styled.div`
  padding: 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  text-decoration: none;
  margin-left: auto;
`
const UserMenuIcon = styled.div`
  background: #eee;
  border-radius: 50%;
  padding: 12px;
  height: auto;
  flex-shrink: 0;
  flex-grow: 0;
  color: ${colors.font._500}
`
const Logo = styled.div`
  color: #FF5722;
  letter-spacing: .5px;
`
const LogoBg = styled.div`

`

const TopBar = ({ pages, blocks, logoutUrl }) => {
  return <Header>
    <HeaderRow>
      <Flex align='center' justify='center'>
        <HeaderLink to='/c'>
          <LogoBg>
            <Logo>Project name</Logo>
          </LogoBg>
        </HeaderLink>
      </Flex>
      <HoverDown
        align='left'
        links={pages.map(page => ({ label: page.name, to: `/c/pages/${page.id}` }))}
      >
        <HeaderLink activeClassName='active' to='/c/pages'>Pages</HeaderLink>
      </HoverDown>
      <HoverDown
        align='left'
        links={blocks.map(block => ({ label: block.name, to: `/c/blocks/${block.id}` }))}
      >
        <HeaderLink activeClassName='active' to='/c/blocks'>Blocks</HeaderLink>
      </HoverDown>
      <HeaderLink activeClassName='active' to='/c/settings'>Settings</HeaderLink>
      <UserMenuLink >
        <UserMenuIcon >
          <Icon name={'person'} />
        </UserMenuIcon>
        <Dropdown links={[{ to: '/c/app/profile', label: 'Profile' }, { to: logoutUrl, label: 'Logout', isExternal: true }]} />
      </UserMenuLink>
    </HeaderRow>
  </Header>
}

const mapStateToProps = (store, ownProps) => {
  return {
    pages: store.pages,
    blocks: store.blocks.content.slice(0, 5),
    logoutUrl: `${makeSiteLink(store.env)}/c/logout`
  }
}
const mapDispatchToProps = {

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)
