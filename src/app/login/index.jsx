import React, { useState } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Router, Route } from 'react-router'
import { createBrowserHistory } from 'history'
import { Link } from 'react-router-dom'

import { FormComplete, FormHeading, FormContainer } from '../components/form'
import { get, put } from '../actions/http-action'
import { colors, bgs } from '../theme'
import { useDidMount } from '../../utils/functions'
import '../css/main.css'

const history = createBrowserHistory()

const Layout = styled.main`
  ${bgs.gradient}
  background-color: ${colors.secondary._400};
  display: flex; 
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`

const getTokenFromURL = () => document.location.pathname.split('/').pop()

const LoginApp = () => {
  return <Layout>
    <LoginForm />
  </Layout>
}

const SetupApp = () => {
  return <Layout>

    <FormComplete
      title={'New Site Setup'}
      fields={{
        adminEmail: { value: '', label: 'Admin email', type: 'email' },
        adminPassword: { value: '', label: 'Password', type: 'password' },
        siteName: { value: '', label: 'Site Name', type: 'text' }
      }}
      actionText={'Submit'}
      postUrl={`/site/setup`}
      httpCall={put}
      onSuccessAction={
        () => {
          setTimeout(() => {
            document.location = '/c'
          }, 1500)
        }
      }
      onSuccessMessage={'Success! Redirecting to app...'}
    />

  </Layout>
}
const RegisterApp = () => {
  return <Layout>
    <RegisterForm />
  </Layout>
}
const ForgotPasswordApp = (props) => {
  const resetPasswordToken = props.match.params.token
  return <Layout>
    {resetPasswordToken
      ? <ResetPasswordForm />
      : <ForgotPasswordForm />
    }
  </Layout>
}

const RegisterForm = () => {
  const [isBadToken, setIsBadToken] = useState(false)
  const didMount = useDidMount()
  const verifyToken = async () => {
    if (didMount) return
    try {
      await get({ url: `/user/register/${getTokenFromURL()}/verify` }, false)
    } catch (badRequest) {
      setIsBadToken(true)
    }
  }
  verifyToken()
  return isBadToken
    ? <FormContainer>
      <FormHeading>Register from invite</FormHeading>
      <h6>Register token expired or malformed.</h6>
      <div> <Link to='/c/login'>Login</Link></div>
    </FormContainer>
    : <FormComplete
      title={'Register from invite'}
      fields={{
        password: { value: '', label: 'Password', type: 'password' }
      }}
      actionText={'Submit'}
      postUrl={`/user/register/${getTokenFromURL()}`}
      onSuccessAction={
        () => {
          setTimeout(() => {
            document.location = '/c/login'
          }, 1500)
        }
      }
      onSuccessMessage={'Success! Redirecting to login...'}
    />
}

const ForgotPasswordForm = () => {
  return <FormComplete
    title={'Forgot Password'}
    fields={{
      email: { value: '', label: 'Email', type: 'email' }
    }}
    actionText={'Submit'}
    postUrl={'/user/forgot-password'}
    onSuccessAction={
      () => {
        setTimeout(() => {
          document.location = '/c'
        }, 1500)
      }
    }
    onSuccessMessage={'Success! Reset password link has been sent to your email.'}
    actionsLinks={<div> <Link to='/c/Login'>Login</Link></div>}
  />
}

const ResetPasswordForm = () => {
  return <FormComplete
    title={'Reset Password'}
    fields={{
      password: { value: '', label: 'Password', type: 'password' },
      passwordRetyped: { value: '', label: 'Re-type Password', type: 'password' }
    }}
    actionText={'Submit'}
    postUrl={`/user/forgot-password/${getTokenFromURL()}`}
    onSuccessAction={
      () => {
        setTimeout(() => {
          document.location = '/c/login'
        }, 1500)
      }
    }
    onSuccessMessage={'Succesfully reset password. Redirecting...'}
  />
}

const LoginForm = () => {
  return <FormComplete
    title={'Login'}
    fields={{
      email: { value: '', label: 'Email', type: 'email' },
      password: { value: '', label: 'Password', type: 'password' }
    }}
    actionText={'Login'}
    postUrl={'/user/login'}
    onSuccessAction={
      () => {
        setTimeout(() => {
          document.location = '/c'
        }, 1500)
      }
    }
    onSuccessMessage={'Success! Redirecting...'}
    actionsLinks={<div> <Link to='/c/forgot-password'>Forgot password?</Link></div>}
  />
}

render(
  <Router history={history}>
    <Route exact path='/c/setup' component={SetupApp} />
    <Route exact path='/c/login' component={LoginApp} />
    <Route path='/c/register/:token' component={RegisterApp} />
    <Route exact path='/c/forgot-password' component={ForgotPasswordApp} />
    <Route exact path='/c/forgot-password/:token' component={ForgotPasswordApp} />
  </Router>,
  document.querySelector('#root')
)
