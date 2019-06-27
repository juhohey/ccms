import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { FieldInput } from '../../components/form/input'
import { get, put } from '../../actions/http-action'
import Button from '../../components/button'
import { getPropertySetter } from '../../../utils/hooks'
import Invites from './invites'
import { Container } from '../../components/flex'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

const SettingsView = styled.section`

`

const Settings = () => {
  const [settings, setSettings] = useState({ name: '' })
  const [uploaded, callUpload] = useState(0)
  const saveSettings = () => callUpload(uploaded + 1)
  useEffect(() => {
    const fetchData = async () => {
      const dbSettings = await get({ url: '/site' })
      setSettings(dbSettings)
    }
    fetchData()
  }, [])
  useEffect(() => {
    if (uploaded === 0) return
    const fetchData = async () => {
      await put({ url: '/site', body: settings })
    }
    fetchData()
  }, [uploaded])

  if (!settings) return null
  const onNameChange = getPropertySetter(setSettings, settings)('name')

  return <SettingsView>
    <Container>
      <h1>Settings</h1>
      <Tabs>
        <TabList>
          <Tab>Site</Tab>
          <Tab>User Invites</Tab>
        </TabList>
        <TabPanel>
          <h6>Site Settings</h6>
          <FieldInput
            label='Site name'
            value={settings.name}
            onChange={onNameChange}
          />
          <Button action='save' onClick={saveSettings}>Save</Button>
        </TabPanel>
        <TabPanel>
          <Invites />
        </TabPanel>
      </Tabs>

    </Container>
  </SettingsView>
}

export default Settings
