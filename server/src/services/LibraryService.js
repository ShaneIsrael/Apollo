const { Library, Series, Movie, Metadata } = require('../database/models')

const service = {}

function generateTag(name) {
  return name.replace(/\s/g, '-').toLowerCase()
}

service.isCrawlingActive = async () => {
  try {
    const crawling = await Library.findOne({
      where: {
        crawling: true
      }
    })
    if (crawling) return true
    return false
  } catch (err) {
    throw err
  }
}

service.getLibraries = async () => {
  try {
    const libraries = await Library.findAll({
      order: [['name', 'ASC']],
      raw: true
    })
    return libraries
  } catch (err) {
    throw err
  }
}

service.getLibrary = async (id) => {
  try {
    const res = await Library.findByPk(id)
    return res
  } catch (err) {
    throw err
  }
}

service.getLibraryByTag = async (tag) => {
  try {
    const res = await Library.findOne({
      where: {
        tag
      }
    })
    return res
  } catch (err) {
    throw err
  }
}

service.createLibrary = async (name, path, type, description, misc) => {
  try {
    const res = await Library.create({
      name,
      path,
      type,
      description,
      misc,
      tag: generateTag(name)
    })
    return res
  } catch (err) {
    throw err
  }
}

service.updateLibrary = async (id, update) => {
  try {
    const { name, type, path, description, misc } = update
    const res = await Library.update(
      {
        name, 
        type, 
        path,
        tag: generateTag(name),
        description,
        misc,
      },
      { where: { id } }
    )
    return res
  } catch (err) {
    throw err
  }
}

service.deleteLibrary = (id) => {
  try {
    Library.destroy(
      { where: { id } }
    )
  } catch (err) {
    throw err
  }
}

service.getAllLibrarySeries = async (id) => {
  try {
    const info = await Library.findByPk(id, {
      include: [{ model: Series, attributes: ['id', 'uuid', 'name'], include: [{ model: Metadata, attributes: ['name', 'local_poster_path']}]}],
      order: [['Series', 'name', 'ASC']]
    })
    return info
  } catch (err) {
    throw err
  }
}

service.getAllLibraryMovies = async (id) => {
  try {
    const info = await Library.findByPk(id, {
      attributes: ['tag'],
      include: [{ model: Movie, attributes: ['id', 'uuid', 'name'], include: [{ model: Metadata, attributes: ['name', 'local_poster_path']}]}],
      order: [['Movies', 'name', 'ASC']],
    })
    return info
  } catch (err) {
    throw err
  }
}

module.exports = service