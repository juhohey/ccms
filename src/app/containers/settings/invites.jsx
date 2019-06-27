import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { FieldInput } from '../../components/form/input'
import http, { put } from '../../actions/http-action'
import Button from '../../components/button'
import { getPropertySetter } from '../../../utils/hooks'
import { validateEmail } from '../../../utils/string'
import Table from '../../components/table'
import ConfirmButton from '../../components/confirm'
import { submitOnEnter } from '../../../utils/keyboard'
import { showSnack } from '../../../utils/snackbar'

const InviteContainer = styled.section`
  margin-bottom: 48px;
`
const InviteUrl = styled.code`
display: block;
overflow: scroll;
padding: 14px;

`

const Invites = () => {
  const [invites, setInvites] = useState([])
  const [nextInvite, setNextInvite] = useState({ email: '', shouldSendEmailInvite: true })

  const getInvites = async () => {
    const dbInvites = await http({ url: '/user/invite', method: 'GET' }, false)
    setInvites(dbInvites.invites)
  }
  const deleteInvite = async (id) => {
    await http({ url: `/user/invite/${id}`, method: 'DELETE' }, false)
    getInvites()
  }

  useEffect(() => {
    getInvites()
  }, [])
  const sendInvite = async () => {
    if (!canSendNextInvite) return
    try {
      await put({ url: '/user/invite', body: nextInvite }, false)
      setNextInvite({ ...nextInvite, email: '' })
      getInvites()
      showSnack('Invitation sent!')
    } catch (error) {
      showSnack(error)
    }
  }

  const canSendNextInvite = validateEmail(nextInvite.email)
  const propertySetter = getPropertySetter(setNextInvite, nextInvite)

  return <div>
    <InviteContainer onKeyDown={submitOnEnter(sendInvite)}>
      <h6>Invite new user</h6>
      <FieldInput label='email' type='email' value={nextInvite.email} onChange={propertySetter('email')} />
      <FieldInput label='Send invitation email' type='checkbox' checked={nextInvite.shouldSendEmailInvite} onChange={propertySetter('shouldSendEmailInvite')} />
      <Button action='confirm' disabled={!canSendNextInvite} onClick={sendInvite} >Send</Button>
    </InviteContainer>
    <div>
      <h6>Invites</h6>
      <Table
        css={'td:nth-child(3){padding: 0;}'}
        header={['Email', 'Created', 'Link', 'Actions']}
        items={invites.map(
          ({ id, email, issued, url }) => [
            email, new Date(parseInt(issued)).toISOString(), <InviteUrl>{url}</InviteUrl>,
            <ConfirmButton label='Delete' onConfirm={e => deleteInvite(id)} />
          ]
        )}
      />
    </div>
  </div>
}

export default Invites
