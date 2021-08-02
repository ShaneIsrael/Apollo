const service = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDuration(duration) {
  if (duration) {
    const durationSplit = duration.split('.')[0].split(':')
    let [hours, minutes, seconds] = durationSplit
    seconds = Number(seconds)
    seconds += Number(minutes) * 60
    seconds += Number(hours) * 60 * 60
    return seconds
  } else {
    return 0
  }
}

service.getMedia = async (library, db) => {
  if (!db[library]) return null

  const mediaData = []
  for (const mTitle of Object.keys(db[library].media)) {
    let seasonsCount = null, episodesCount = null, runtime = 0, width = 0
    if (db[library].type === 'series') {
      seasonsCount = Object.keys(db[library].media[mTitle].seasons).filter((s) => s !== '00').length
      for (const season of Object.keys(db[library].media[mTitle].seasons).sort()) {
        if (!episodesCount) {
          episodesCount = db[library].media[mTitle].seasons[season].length
        } else {
          episodesCount += db[library].media[mTitle].seasons[season].length
        }
        for (const episode of db[library].media[mTitle].seasons[season]) {
          width = episode.data.video.width
          if (episode.data.video.tags) {
            runtime += calculateDuration(episode.data.video.tags.DURATION)
          }
        }
        
      }
    } else {
      width = db[library].media[mTitle].data.video.width
      if (db[library].media[mTitle].data.video.tags) {
        runtime = calculateDuration(db[library].media[mTitle].data.video.tags.DURATION)
      }
    }
    mediaData.push({
      title: mTitle,
      seasons: seasonsCount,
      episodes: episodesCount,
      runtime,
      width,
    })
    
  }
  await sleep(500)
  return {
    media: mediaData,
    type: db[library].type
  }
}

module.exports = service