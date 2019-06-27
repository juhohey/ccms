const path = require('path')
const fs = require('fs')
const ReactDOMServer = require('react-dom/server')
const webpack = require('webpack')
const { createElement } = require('react')
const { flatten, uniqBy, prop } = require('ramda')

const { createElementNested } = require('../../utils/vdom')
const { getBlockIdsFromContent, mapBlocksToContent } = require('../../utils/cms')
const { createBundleComponent, getWebpackConfig } = require('../../utils/bundling')

const BUNDLE_PATHS = {
  entry: '../../../cms/bundles',
  output: '../../../public/assets/bundles',
  custom: '../../../cms/components'
}

const createBundle = (componentsAsString, customComponents) => {
  const customRequires = uniqBy(prop('name'), customComponents)
    .map(custom => `import ${custom.name} from '../components/${custom.path}';`)
    .join('\n')

  return `
  import React from 'react'
  import { render } from 'react-dom'
  ` + `${customRequires}` + `
  render(
    React.createElement('div', {}, ${componentsAsString}),
    document.querySelector('#root')
  )
  `
}
const send404 = async (db, res) => {
  const notFoundPage = await db('pages').findOne({ route: '/404', isPublished: true })
  if (!notFoundPage) res.sendStatus(404)
  else {
    const notFoundComponents = await db('layout').findOne({ page: notFoundPage.id })
    const content = render(notFoundComponents.content)
    res.send(content)
  }
}

const render = (components, fileName) => {
  const html = ReactDOMServer.renderToString(
    createElement('div', {}, components.map(createElementNested(true)))
  )
  const markup = fs.readFileSync('public/index.html').toString().replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  ).replace(
    '<script src="/assets/cms.bundle.js"></script>',
    fileName
      ? `<script src='/assets/bundles/${fileName}'></script>`
      : ''
  )

  return markup
}

const addBlocksToContentIfExists = async (db, content) => {
  const blockIds = flatten(getBlockIdsFromContent(content))
  if (!blockIds.length) {
    return content
  } else {
    const blocks = await db('blocks').find({ id: { '$in': blockIds } })
    console.log('blocks', content, blocks)
    const contentWithBlocks = mapBlocksToContent(content, blocks)
    return contentWithBlocks
  }
}

// TODO: remove DB queries from route
module.exports.render = async (pathFromParams, db, res) => {
  const pagesPage = await db('pages').findOne({ route: pathFromParams, isPublished: true })
  if (!pagesPage) {
    send404(db, res)
  } else {
    const layout = await db('layout').findOne({ page: pagesPage.id })
    const contentWithBlocks = await addBlocksToContentIfExists(db, layout.content)
    const content = render(contentWithBlocks, layout.bundleName)
    res.send(content)
  }
}

const getCustomComponents = list => list.reduce((acc, next) => {
  if (next.children && next.children.map) {
    const childrenHaveCustomComponents = flatten(getCustomComponents(next.children))
    return next.element.custom ? acc.concat([next.element.custom, childrenHaveCustomComponents]) : acc.concat(childrenHaveCustomComponents)
  } else {
    return next.element && next.element.custom ? acc.concat(next.element.custom) : acc
  }
}, [])

module.exports.generateBundle = (db, pageName, content, paths = BUNDLE_PATHS) => new Promise(async (resolve, reject) => {
  const fileName = `page.${pageName}.bundle.js`
  const contentWithBlocks = await addBlocksToContentIfExists(db, content)
  const bundle = createBundle(contentWithBlocks.map(createBundleComponent), getCustomComponents(content))

  fs.writeFileSync(path.resolve(__dirname, `${paths.entry}/${fileName}`), bundle)

  const pathsMapped = {
    entry: path.resolve(__dirname, `${paths.entry}/${fileName}`),
    output: path.resolve(__dirname, `${paths.output}`),
    include: [
      path.resolve(__dirname, `${paths.entry}`),
      path.resolve(__dirname, `${paths.custom}`)
    ]
  }
  webpack(getWebpackConfig(fileName, pathsMapped), (err, stats) => { // Stats Object
    if (err || stats.hasErrors()) {
      console.log(':(', stats.hasErrors())
      reject(stats.toJson())
    } else {
      resolve(fileName)
    }
  })
})

module.exports.renderForTests = render
