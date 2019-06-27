import React from 'react'
import { Route } from 'react-router-dom'
import styled from 'styled-components'
import Page from '../page'
import Settings from '../settings'
import Pages from '../pages'
import TopBar from '../top-bar'
import Profile from '../profile'
import Dashboard from '../dashboard'
import PageDashboard from '../page-dashboard'
import Blocks from '../blocks'
import Block from '../block'

const Layout = styled.div`
  min-height: 90vh;
`
const App = ({ env }) => {
  return <>
    <TopBar />
    <Layout>
      <Route exact path='/c' component={Dashboard} />
      <Route exact path='/c/blocks' component={Blocks} />
      <Route exact path='/c/blocks/:id' component={Block} />
      <Route exact path='/c/pages' component={Pages} />
      <Route exact path='/c/pages/:id' component={PageDashboard} />
      <Route exact path='/c/pages/:id/page' component={Page} />
      <Route exact path='/c/settings' component={Settings} />
      <Route exact path='/c/app/profile' component={Profile} />
    </Layout>
  </>
}

export default App
