import { flatRoutes } from 'remix-flat-routes'

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  postcss: true,
  tailwind: true,

  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['./tailwind.config.ts'],
  cacheDirectory: './node_modules/.cache/remix',

  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes)
  },
}
