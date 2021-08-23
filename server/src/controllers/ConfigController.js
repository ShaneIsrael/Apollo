const { Config, User } = require('../database/models')
const controller = {}

controller.getConfig = async (req, res, next) => {
  try {    
    const config = await Config.findOne({
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).send(config)
  } catch (err) {
    return next(err)
  }
}

controller.saveConfig = async (req, res, next) => {
  const { id, enableAdmin, restrictAccess } = req.body

  try {
    if (enableAdmin) {
      // check that an admin exists
      const admin = await User.findOne({
        where: { role: 'admin' }
      })
      if (!admin) {
        return res.status(409).send('An Admin Account is required in order to Enable Admin')
      }
    }
    if (restrictAccess) {
      const user = await User.findOne()
      if (!user) {
        return res.status(409).send('At least one user or admin must exist in order to Restrict Access')
      }
    }
    if (id) {
      const config = await Config.findOne({
        where: { id }
      })
      config.enableAdmin = enableAdmin
      config.restrictAccess = restrictAccess
      config.save()
      return res.status(200).send(config)
    } else {
      const config = await Config.create({
        enableAdmin,
        restrictAccess 
      })
      return res.status(201).send(config)
    }
  } catch (err) {
    return next(err)
  }
}

module.exports = controller