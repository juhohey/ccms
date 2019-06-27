const fs = require('fs')

const templateVariables = {
  recipient: '{{recipient}}',
  resetPasswordLink: '{{resetPasswordLink}}',
  inviteLink: '{{inviteLink}}',
  siteName: '{{siteName}}',
  siteUrl: '{{siteUrl}}',
  senderName: '{{senderName}}'
}

const renderEmail = (file, replacePairs) => {
  // Mutate file
  for (let i = 0; i < replacePairs.length; i++) {
    const [templateVar, value] = replacePairs[i]
    file = file.replace(new RegExp(templateVar, 'gi'), value)
  }
  return file
}
const renderEmailFromFile = (name, replacePairs) => renderEmail(fs.readFileSync(name).toString(), replacePairs)

module.exports.email = {
  forgotPassword: async (provider, { recipient, resetPasswordLink, siteName, siteUrl }) => {
    const variablePairs = [
      [templateVariables.resetPasswordLink, resetPasswordLink],
      [templateVariables.siteName, siteName],
      [templateVariables.recipient, recipient],
      [templateVariables.siteUrl, siteUrl]
    ]
    const email = renderEmailFromFile('src/api/email/templates/forgot-password.html', variablePairs)
    const result = await provider(recipient, email, 'Forgot password - C')
    return result
  },
  invite: async (provider, { recipient, inviteLink, siteName, siteUrl, senderName }) => {
    const variablePairs = [
      [templateVariables.inviteLink, inviteLink],
      [templateVariables.siteName, siteName],
      [templateVariables.recipient, recipient],
      [templateVariables.siteUrl, siteUrl],
      [templateVariables.senderName, senderName]

    ]
    const email = renderEmailFromFile('src/api/email/templates/invite.html', variablePairs)
    const result = await provider(recipient, email, 'Invite - C')
    return result
  }
}

// TODO: integration tests for providers..?
module.exports.getProvider = (env) => {
  const { EMAIL_PROVIDER, AWS_REGION, EMAIL_SENDER_ADDRESS } = env
  switch (EMAIL_PROVIDER.toLowerCase()) {
    case 'ses':
      const provider = require('./providers/ses')({ sender: EMAIL_SENDER_ADDRESS, region: AWS_REGION })
      return provider
    case 'test':
    default:
      return (recipient, email, title) => ({ recipient, email, title })
  }
}

module.exports.renderEmailForTests = renderEmail
module.exports.templateVariablesForTests = templateVariables
