# build sqlite3 cross platform binaries
./server/node_modules/.bin/node-pre-gyp install --directory=./server/node_modules/sqlite3 --target_platform=win32 --target_arch=ia32
./server/node_modules/.bin/node-pre-gyp install --directory=./server/node_modules/sqlite3 --target_platform=win32 --target_arch=x64
./server/node_modules/.bin/node-pre-gyp install --directory=./server/node_modules/sqlite3 --target_platform=darwin --target_arch=x64
./server/node_modules/.bin/node-pre-gyp install --directory=./server/node_modules/sqlite3 --target_platform=linux --target_arch=x64

# create temporary binary folders
mkdir -p ./build-deps/binaries/ffprobe-static
mkdir -p ./build-deps/binaries/sqlite3

# copy dist dependencies to temp directory
cp -rf ./server/node_modules/ffprobe-static/bin/* ./build-deps/binaries/ffprobe-static/
cp -rf ./server/node_modules/sqlite3/lib/binding/* ./build-deps/binaries/sqlite3/
cp ./server/config.template.json ./build-deps/config.json

# create dist folder structure
mkdir -p ./dist/linux/binaries/ffprobe-static
mkdir -p ./dist/darwin/binaries/ffprobe-static
mkdir -p ./dist/win32/ia32/binaries/ffprobe-static
mkdir -p ./dist/win32/x64/binaries/ffprobe-static

# copy template config.json
cp -f ./build-deps/config.json ./dist/linux/ 
cp -f ./build-deps/config.json ./dist/darwin/ 
cp -f ./build-deps/config.json ./dist/win32/ia32/
cp -f ./build-deps/config.json ./dist/win32/x64

# copy binary dependencies
cp -f ./build-deps/binaries/ffprobe-static/linux/x64/* ./dist/linux/binaries/ffprobe-static
cp -f ./build-deps/binaries/ffprobe-static/darwin/x64/* ./dist/darwin/binaries/ffprobe-static
cp -f ./build-deps/binaries/ffprobe-static/win32/ia32/* ./dist/win32/ia32/binaries/ffprobe-static
cp -f ./build-deps/binaries/ffprobe-static/win32/x64/* ./dist/win32/x64/binaries/ffprobe-static

cp -f ./build-deps/binaries/sqlite3/napi-v3-linux-x64/node_sqlite3.node ./dist/linux/
cp -f ./build-deps/binaries/sqlite3/napi-v3-darwin-x64/node_sqlite3.node ./dist/darwin/
cp -f ./build-deps/binaries/sqlite3/napi-v3-win32-x64/node_sqlite3.node ./dist/win32/x64/
cp -f ./build-deps/binaries/sqlite3/napi-v3-win32-ia32/node_sqlite3.node ./dist/win32/ia32/

# build the ui
cd ui && npm run build && cd ..

# package the app into executables
pkg ./server/package.json

# copy executables
cp -f ./dist/apollo-linux ./dist/linux/
cp -f ./dist/apollo-macos ./dist/darwin/
cp -f ./dist/apollo-win.exe ./dist/win32/ia32/
cp -f ./dist/apollo-win.exe ./dist/win32/x64/

# cleanup
rm -rf ./build-deps
rm ./dist/apollo-linux
rm ./dist/apollo-macos
rm ./dist/apollo-win.exe
