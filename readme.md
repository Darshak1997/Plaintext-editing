# Rethink Plaintext Editing

## To run the challenge:

1. Clone or download this repo and `cd rethink-plaintext-editing`
2. Run `npm install && npm run dev`
3. Open `localhost:3000` in your browser

## Goals Achieved

1. Text Editor for .txt files. I have used Draftjs for this feature and implemented the editor box using Facebooks smaple editor code (https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/rich)
2. Date Modified changes as soon as you edit anything inside the file.
3. Updated content can be seen when you visit that file after some time.
4. .md files have Markdown editor and Previewer both. I have used an npm package called react-markdown-preview.
5. .js files can be edited too.

## Limitations

1. Content of the file does not hold the structure when the content of the file gets updated.
2. Changes are not persistent after reloading.
