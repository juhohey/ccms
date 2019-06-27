// Load the AWS SDK for Node.js
var AWS = require('aws-sdk')

module.exports = ({ sender, region }) => (recipient, email, subject) =>
  new Promise((resolve, reject) => {
    AWS.config.update({ region })

    // Create sendEmail params
    var params = {
      Destination: { /* required */
        ToAddresses: [
          recipient
        ]
      },
      Message: { /* required */
        Body: { /* required */
          Html: {
            Charset: 'UTF-8',
            Data: email
          }
          // Text: {
          //   Charset: 'UTF-8',
          //   Data: 'TEXT_FORMAT_BODY'
          // }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: sender, /* required */
      ReplyToAddresses: [
        sender
      ]
    }

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise()

    // Handle promise's fulfilled/rejected states
    sendPromise.then(resolve).catch(reject)
  })
