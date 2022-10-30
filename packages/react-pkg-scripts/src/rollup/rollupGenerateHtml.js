import fs from 'fs-extra';
import { makeHtmlAttributes } from '@rollup/plugin-html';
import template from 'lodash.template';
import { paths } from '../paths';

export async function generateHTML({ attributes, files, meta, publicPath }) {
  const htmlTemplate = await fs.readFile(paths.playgroundHTML, {
    encoding: 'utf-8',
  });

  const compileTemplate = template(htmlTemplate);

  const scripts = (files.js || [])
    .map(({ fileName, isDynamicEntry }) => {
      if (isDynamicEntry) return '';
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .filter(Boolean)
    .join('\n');

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join('\n');

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join('\n');

  const source = compileTemplate({ metas, links, scripts });

  return source;
}
