const { validatorMiddleware } = require('../../db/models')

module.exports = (app, db) => {
  app.get('/c/api/blocks', async (req, res) => {
    try {
      const blocks = await db('blocks').find()
      res.json(blocks)
    } catch (error) {
      res.status(500).send(`Blocks: ${error.message}`)
    }
  })

  app.get('/c/api/blocks/:id', async (req, res) => {
    try {
      const block = await db('blocks').findOne({ id: req.params.id })
      res.json(block)
    } catch (error) {
      res.status(500).send(`Blocks find: ${error.message}`)
    }
  })

  app.put('/c/api/blocks', validatorMiddleware('blocks'), async (req, res) => {
    try {
      await db('blocks').insert(req.body)
      res.json({ affected: 1 })
    } catch (error) {
      res.status(500).send(`Blocs create: ${error.message}`)
    }
  })

  app.post('/c/api/blocks/:id', validatorMiddleware('blocks'), async (req, res) => {
    try {
      const result = await db('blocks').update({ id: req.params.id }, req.body)
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Blocs edit error: ${error.message}`)
    }
  })

  /*
  * TODO: blocksCascadeOnDelete
  */
  app.delete('/c/api/blocks/:id', validatorMiddleware('blocks'), async (req, res) => {
    try {
      const result = await db('blocks').remove({ id: req.params.id })
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Blocks delete: ${error.message}`)
    }
  })
}
