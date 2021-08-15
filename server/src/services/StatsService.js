const { Library, Stats } = require('../database/models')

const service = {}

async function getLibraryStats(library) {
  const stats = await Stats.findOne({
    where: {
      libraryId: library.id,
      tag: 'general-stats'
    },
    order: [['createdAt', 'DESC']]
  })
  if (!stats) return false
  return stats.json
}

service.getLibraryStats = async (id) => {
  try {
    const library = await Library.findByPk(id)
    const stats = await getLibraryStats(library)
    return stats
  } catch (err) {
    throw err
  }
}

service.getLibrarySizes = async () => {
  try {
    const stats = await Stats.findOne({
      where: {
        tag: 'all-library-sizes'
      },
      order: [['createdAt', 'DESC']]
    })
    if (!stats) return null
    return stats.json
  } catch (err) {
    throw err
  }
}

service.getMediaYears = async () => {
  try {
    const stats = await Stats.findOne({
      where: {
        tag: 'all-media-years'
      },
      order: [['createdAt', 'DESC']]
    })
    if (!stats) return null
    return stats.json
  } catch (err) {
    throw err
  }
}

module.exports = service