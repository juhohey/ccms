import { isString } from './string'
import htmlToJSX from './html-to-jsx'

export const getWebpackConfig = (fileName, { entry, output, include }) => ({
  mode: 'production',
  entry,
  output: {
    filename: fileName,
    path: output
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
        include,
        loader: 'babel-loader',
        resolve: {
          extensions: ['.js', '.jsx']
        },
        options: {
          presets: ['@babel/preset-react'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-syntax-dynamic-import'
          ]
        }
      }
    ]
  }
})

export const createBundleComponent = (component) => {
  if (isString(component)) return htmlToJSX(component)

  const children = component.children
    ? isString(component.children)
      ? [component.children]
      : component.children.map(createBundleComponent)
    : null
  const tag = component.element
    ? component.element.custom
      ? component.element.custom.name
      : `'${component.element.tag}'`
    : 'p'

  // // Note: text component will not be rendered
  // if (component.element.name === 'text') {
  //   return children
  // }
  const toString = `React.createElement(${tag}, ${JSON.stringify(component.props) || null}, ${children})`
  return toString
}
