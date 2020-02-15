import { resolve } from 'path';

import { getSidebarItems } from './static-config-helpers/md-data-transforms';
import { webpack } from './static-config-parts/static-webpack-config';
import { metaData } from './static-config-parts/constants';

const docsContentPath = resolve(__dirname, '../../docs/');

export default {
  plugins: [
    'react-static-plugin-styled-components',
    'react-static-plugin-react-router',
  ],
  paths: {
    root: process.cwd(),
    src: 'src',
    dist: 'dist',
    assets: 'dist',

    buildArtifacts: 'node_modules/.cache/react-static/artifacts/',
    devDist: 'node_modules/.cache/react-static/dist/',
    temp: 'node_modules/.cache/react-static/temp/',
  },

  webpack,
  basePath: 'open-source/urql',
  stagingBasePath: 'open-source/urql',
  devBasePath: '',

  getSiteData: () => ({
    title: metaData.title,
  }),

  getRoutes: async () => {
    const sidebarItems = await getSidebarItems(docsContentPath);
    const sidebarHeaders = sidebarItems.map(d => ({
      title: d.title,
      path: `/${d.slug}/`,
      slug: d.slug,
    }));

    return [
      {
        path: '/',
        template: 'src/screens/home',
      },
      {
        path: '/docs',
        template: 'src/screens/docs',
        getData: () => ({
          title: `${metaData.title} | Documentation`,
          markdown: sidebarItems[0].markdown,
          renderedMd: sidebarItems[0].content,
          sidebarHeaders,
          tocArray: sidebarItems[0].data.subHeadings.map(sh => ({
            content: sh.value,
            level: sh.depth,
          })),
        }),
        // move slug + path to data in transform, renderedMd to data, and nuke markdown prop
        children: sidebarItems.map(
          ({ slug, path, markdown, content, data }) => ({
            path,
            template: 'src/screens/docs',
            getData: () => ({
              title: data.title,
              markdown,
              path: `/${slug}/`,
              renderedMd: content,
              sidebarHeaders,
              tocArray: data.subHeadings.map(sh => ({
                content: sh.value,
                level: sh.depth,
              })),
            }),
          })
        ),
      },
    ];
  },
};
