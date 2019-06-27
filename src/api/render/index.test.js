require('@babel/register') // Magic babel require wrapper
const fs = require('fs')
const test = require('tape')
const ReactDOMServer = require('react-dom/server')
const { createElement } = require('react')

const renderer = require('./index')
const { createElementNested } = require('../../utils/vdom')
const server = require('../index')
const { injectTestEnv } = require('../../test/api')
const { getDb } = require('../db/index')

const TEST_PAGE_CONTENT = [{ element: { tag: 'div' }, props: { istest: 'true' }, children: [{ element: { tag: 'div' }, props: null, children: null }] }]

let app

test('API - setup', async t => {
  injectTestEnv()
  app = server()
  t.end()
})

test('Render - create bundle', t => {
  const content = TEST_PAGE_CONTENT
  const pageName = 'test'
  t.plan(1)

  const paths = { entry: '../../../cms/bundles', output: '../../../public/assets/bundles', custom: '../../../cms' }
  renderer.generateBundle(getDb(), pageName, content, paths)
    .then(fileName => {
      t.equal(fileName, `page.${pageName}.bundle.js`)
      t.comment('Bundle created succesfully, cleaning up...')
      fs.unlinkSync(`cms/bundles/${fileName}`)
      fs.unlinkSync(`public/assets/bundles/${fileName}`)
    })
    .catch(err => {
      console.log('Unexpected error: ', err)
    })
})

test('Render - render 404: no content found', t => {
  t.plan(1)
  const mockDbNo404Page = (collection) => ({
    findOne: () => null
  })
  const mockRes = {
    send: html => {},
    sendStatus: status => {
      t.equal(status, 404, 'statusCode is 404, no content')
    } }
  renderer.render('/', mockDbNo404Page, mockRes)
})

test('Render - render 404: send 404 page', t => {
  t.plan(1)
  const content = [{ element: { tag: 'div' }, props: {}, children: '<h1>404</h1>' }]
  const rendered = ReactDOMServer.renderToString(
    createElement('div', {}, content.map(createElementNested(true)))
  )

  const mockDb404Page = (collection) => {
    if (collection === 'pages') {
      return {
        findOne: params => {
          if (params.route === '/404') return { id: 1 }
        }
      }
    } else {
      return { findOne: params => {
        if (params.page === 1) return { content }
        else return null
      } }
    }
  }
  const mockRes = {
    send: html => {
      t.equal(html.includes(rendered), true, 'Rendered html is 404 content')
    }
  }
  renderer.render('/', mockDb404Page, mockRes)
})

test('Render - render page', t => {
  t.plan(1)
  const rendered = ReactDOMServer.renderToString(
    createElement('div', {}, TEST_PAGE_CONTENT.map(createElementNested(true)))
  )

  const mockDb = (collection) => {
    if (collection === 'pages') {
      return {
        findOne: params => {
          if (params.route === '/') return { id: 1, name: 'test' }
        }
      }
    } else {
      return { findOne: params => {
        if (params.page === 1) return { content: TEST_PAGE_CONTENT }
        else return null
      } }
    }
  }
  const mockRes = {
    send: html => {
      t.equal(html.includes(rendered), true, 'Rendered html is test ')
    }
  }
  renderer.render('/', mockDb, mockRes)
})

test('teardown', async (t) => {
  app.close()
  t.end()
})
