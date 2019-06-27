import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { clone, equals } from 'ramda'

import { get, post } from '../../actions/http-action'
import { FieldInput } from '../../components/form/input'
import { getPropertySetter } from '../../../utils/hooks'
import Button from '../../components/button'
import { submitOnEnter } from '../../../utils/keyboard'
import { showSnack } from '../../../utils/snackbar'
import { Container } from '../../components/flex'

const PasswordContainer = styled.div`

`

const initialPasswordState = { oldPassword: '', newPassword: '', newPasswordRetyped: '' }

const Profile = () => {
  const [previousProfile, setPreviousProfile] = useState({ email: '' })
  const [profile, setProfile] = useState({ email: '' })
  const [passwords, setPasswords] = useState(clone(initialPasswordState))
  const [passwordStatus, setPasswordStatus] = useState('initial')
  const [profileStatus, setProfileStatus] = useState('initial')

  const profileSetter = getPropertySetter(setProfile, profile)
  const passwordsSetter = getPropertySetter(setPasswords, passwords)

  const canResetPassword = (passwords.oldPassword &&
    (passwords.newPassword === passwords.newPasswordRetyped) &&
    (passwords.newPassword.length) &&
    passwordStatus !== 'loading')
  const canUpdateProfile = (profileStatus !== 'loading' && !equals(previousProfile, profile))

  useEffect(() => {
    get({ url: '/users/me' })
      .then(profile => {
        setPreviousProfile(profile)
        setProfile(profile)
      })
  }, [])

  const updateProfile = async () => {
    if (!canUpdateProfile) return
    try {
      setProfileStatus('loading')
      await post({ url: '/users/me', body: profile })
      showSnack('Profile updated!')
      setPreviousProfile(clone(profile))
      setProfileStatus('success')
    } catch (error) {
      showSnack(`Failed to update profile: ${error}`)
    }
  }

  const updatePassword = async () => {
    if (!canResetPassword) return
    try {
      setPasswordStatus('loading')
      await post({ url: '/users/me/reset-password', body: passwords })
      showSnack('Updated password!')
      setPasswordStatus('success')
      setPasswords(clone(initialPasswordState))
    } catch (error) {
      showSnack(`Failed to update passwords: ${error}`)
    }
  }

  return <Container>
    <h1>Profile</h1>
    <h4>Me</h4>
    <div onKeyDown={submitOnEnter(updateProfile)}>
      <FieldInput value={profile.email} label={'Email'} onChange={profileSetter('email')} />
      <Button
        action='confirm'
        disabled={!canUpdateProfile}
        onClick={updateProfile}
      >Update</Button>
    </div>
    <PasswordContainer>
      <h4>Reset password</h4>
      <div onKeyDown={submitOnEnter(updatePassword)}>
        <FieldInput
          label={'Current password'}
          value={passwords.oldPassword}
          onChange={passwordsSetter('oldPassword')}
          type='password'
        />
        <FieldInput
          label={'New password'}
          value={passwords.newPassword}
          onChange={passwordsSetter('newPassword')}
          type='password'
        />
        <FieldInput
          label={'Re-type new password'}
          value={passwords.newPasswordRetyped}
          onChange={passwordsSetter('newPasswordRetyped')}
          type='password'
        />
      </div>
      <Button
        action='confirm'
        disabled={!canResetPassword}
        onClick={updatePassword}
      >Set password</Button>
    </PasswordContainer>
  </Container>
}

export default Profile
