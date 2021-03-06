var os = require('os');
var path = require('path');

var platform = os.platform();
if (platform !== 'darwin' && platform !=='linux' && platform !== 'win32') {
  console.error('Unsupported platform.');
  process.exit(1);
}

var arch = os.arch();
if (platform === 'darwin' && arch !== 'x64') {
  console.error('Unsupported architecture.');
  process.exit(1);
}

var ffprobePath = path.join(
  path.dirname(process.execPath),
  'binaries',
  'ffprobe-static',
  platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'
)

exports.path = ffprobePath;
