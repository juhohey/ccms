const { assoc, assocPath } = require('ramda')
const { history } = require('./history')
const { pages } = require('./pages')
const { layout } = require('./layout')
const { user } = require('./users')
const { site } = require('./site')
const { block } = require('./blocks')

const getValidator = (modelName) => {
  switch (modelName) {
    case 'history':
      return history
    case 'layout':
      return layout
    case 'pages':
      return pages
    case 'user':
      return user
    case 'site':
      return site
    case 'blocks':
      return block
    default:
      return {}
  }
}

module.exports.validate = (modelName, candidate, requireAllValues, omitUndefined) => {
  const validatorObject = getValidator(modelName)

  return Object.entries(validatorObject).reduce((acc, [name, type]) => {
    const value = candidate[name]
    const isValid = requireAllValues
      ? value && value.constructor === type
      : candidate[name] || value !== undefined && value.constructor === Boolean
    if (isValid) {
      if (omitUndefined && value === undefined) {
        return acc
      } else {
        return assocPath(['valid', name], candidate[name], acc)
      }
    } else {
      return assoc('missing', acc.missing.concat(name), acc)
    }
  }, { missing: [], valid: {} })
}
module.exports.validatorMiddleware = (modelName, requireAllValues, omitUndefined = true) => (req, res, next) => {
  const validated = module.exports.validate(modelName, req.body, requireAllValues)
  if (requireAllValues && !validated.missing.length) {
    return res.status(400).send(validated.missing)
  } else {
    req.body = validated.valid
    return next()
  }
}
