const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')
const { assoc, head } = require('ramda')

const addField = (field, getValue) => values => assoc(field, getValue(), values)
const addCreatedAt = addField('created_at', Date.now)
const addUpdatedAt = addField('updated_at', Date.now)

const mapQueryToLowDb = (query, condition) => {
  const nonPrimitiveValues = Object.values(condition).filter(value => typeof value === 'object')
  if (nonPrimitiveValues.length === 0) {
    return query.filter(condition)
  } else {
    const filterFunctions = Object.entries(condition).reduce((acc, [key, value]) => {
      if (typeof value === 'object') {
        // Cases: $in, TODO: $nin
        const [operator, operatorValue] = head(Object.entries(value))
        switch (operator) {
          case '$in':
          default:
            return acc.concat(candidate => operatorValue.includes(candidate[key]))
        }
      } else { // Primitive, foo: 'bar'
        return acc.concat(candidate => candidate[key] === value)
      }
    }, [])
    const queryConditionFilterFunctions = candidate => filterFunctions.filter(
      filterFunction => filterFunction(candidate)
    ).length === filterFunctions.length
    return query.filter(queryConditionFilterFunctions)
  }
}

module.exports = (config) => {
  const adapter = config.isMemory
    ? new Memory()
    : new FileSync('db.json')

  const db = low(adapter)
  db.defaults({ users: [], forgot_password: [], pages: [], layout: [], history: [], site: [], user_invites: [], blocks: [] }).write()
  return collection => {
    const context = {
      find: (condition, extra = {}) => {
        const { sortBy, limit } = extra
        const query = condition
          ? mapQueryToLowDb(db.get(collection), condition)
          : db.get(collection)
        const sorted = sortBy ? query.orderBy(sortBy, 'desc') : query
        const limited = limit ? sorted.slice(0, limit) : sorted
        return limited.value()
      },
      findOne: (condition) => db.get(collection).filter(condition).take(1).value()[0],
      insert: (values) => db.get(collection).push(addCreatedAt(values)).write(),
      update: (condition, values) => db.get(collection).find(condition).assign(addUpdatedAt(values)).write(),
      remove: (condition) => db.get(collection).remove(condition).write()
    }

    return context
  }
}
