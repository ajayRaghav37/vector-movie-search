npm run build
rm -fr ./Vector/hosting/files
mkdir ./Vector/hosting/files
cp -R ./build/* ./Vector/hosting/files
cd Vector
realm-cli push --include-hosting --reset-cdn-cache
cd ../Triggers
realm-cli push
cd ..
