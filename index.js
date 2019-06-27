require('@babel/register') // babel require/export wrapper
const fs = require('fs')
const app = require('./src/api')
const { injectEnvFile } = require('./src/utils/env')
try {
  injectEnvFile(fs, '.env')
} catch (error) {
  console.log('Error: could not find the environment .env file. Please edit the example .env.example file and rename it to .env')
  console.log('Using the env.example file...')
  injectEnvFile(fs, '.env.example')
}

app()
