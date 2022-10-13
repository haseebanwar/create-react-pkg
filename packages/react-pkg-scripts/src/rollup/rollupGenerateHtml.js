import fs from 'fs-extra';
import { makeHtmlAttributes } from '@rollup/plugin-html';
import { paths } from '../paths';

export async function generateHTML({
  attributes,
  meta,
  bundle,
  files,
  publicPath,
  title,
}) {
  // const a = await fs.readFile(paths.playgroundHTML, { encoding: 'utf-8' });
  // console.log('a', a);
  return `<!DOCTYPE html>
<html ${makeHtmlAttributes(attributes.html)}>
  <head>
    ${meta.map((meta) => `<meta${makeHtmlAttributes(meta)} />`)}
    <title>${title}</title>

  </head>
  <body>
  <div id="root"></div>
  ${files.js
    .map(
      (file) =>
        `<script src="${file.fileName}"${makeHtmlAttributes(
          attributes.script
        )}></script>`
    )
    .join('')}
  
  </body>
</html>`;
}
