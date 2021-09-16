const path = require('path')

module.exports = {
  VALID_EXTENSIONS: ['.mkv', '.flv', '.avi', '.mov', '.mp4', '.m4v', '.m4p', '.mpg', '.mpeg', '.mpv'],
  VALID_TMDB_VIDEO_TYPES: ['Trailer', 'Clip', 'Opening Credits'],
  toGenericPath: (ffpath) => ffpath.split(path.sep).join(path.posix.sep)
}