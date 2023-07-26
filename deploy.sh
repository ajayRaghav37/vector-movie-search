npm run build
rm -fr ./Triggers/hosting/files
mkdir ./Triggers/hosting/files
cp -R ./build/* ./Triggers/hosting/files
cd Triggers
realm-cli push --include-hosting --reset-cdn-cache
cd ..
