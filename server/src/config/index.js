module.exports = {
  development: {
    tmdb_api_key: process.env.TMDB_API_KEY,
    tmdb_read_access_token: process.env.TMDB_READ_ACCESS_TOKEN,
    appdata: process.env.LOCALAPPDATA ? process.env.APPDATA + '/Apollo' : (process.platform == 'darwin' ? process.env.HOME + '/Library/Apollo' : process.env.HOME + "/.apollo"),
    imageDir: '/images',
    logsDir: '/logs',
    dbname: 'dev.sqlite'
  },
  production: {
    tmdb_api_key: process.env.TMDB_API_KEY,
    tmdb_read_access_token: process.env.TMDB_READ_ACCESS_TOKEN,
    appdata: process.env.LOCALAPPDATA ? process.env.APPDATA + '/Apollo' : (process.platform == 'darwin' ? process.env.HOME + '/Library/Apollo' : process.env.HOME + "/.apollo"),
    imageDir: '/images',
    logsDir: '/logs',
    dbname: 'apollo.db'
  },
  docker: {
    tmdb_api_key: process.env.TMDB_API_KEY,
    tmdb_read_access_token: process.env.TMDB_READ_ACCESS_TOKEN,
    appdata: '/data',
    imageDir: '/data/images',
    logsDir: '/data/logs',
    dbname: 'apollo.db'
  }
}