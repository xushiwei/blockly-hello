DATA=`cat data.json`
echo "export const data = \`$DATA\n\`;" > ./src/data.js
#sed 's/<<<PATH>>>/\./g' ./dist/bundle.js > ./static/bundle.js
cp dist/bundle.js ./static/
#load(JSON.parse(
#),I,!1)
#<<<PATH>>>
