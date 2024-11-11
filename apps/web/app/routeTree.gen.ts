/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as appImport } from './routes/__app'
import { Route as appIndexImport } from './routes/__app.index'
import { Route as AuthSigninImport } from './routes/auth/signin'
import { Route as AuthRegisterImport } from './routes/auth/register'
import { Route as appSettingsImport } from './routes/__app.settings'

// Create/Update Routes

const appRoute = appImport.update({
  id: '/__app',
  getParentRoute: () => rootRoute,
} as any)

const appIndexRoute = appIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => appRoute,
} as any)

const AuthSigninRoute = AuthSigninImport.update({
  id: '/auth/signin',
  path: '/auth/signin',
  getParentRoute: () => rootRoute,
} as any)

const AuthRegisterRoute = AuthRegisterImport.update({
  id: '/auth/register',
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any)

const appSettingsRoute = appSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => appRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/__app': {
      id: '/__app'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof appImport
      parentRoute: typeof rootRoute
    }
    '/__app/settings': {
      id: '/__app/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof appSettingsImport
      parentRoute: typeof appImport
    }
    '/auth/register': {
      id: '/auth/register'
      path: '/auth/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterImport
      parentRoute: typeof rootRoute
    }
    '/auth/signin': {
      id: '/auth/signin'
      path: '/auth/signin'
      fullPath: '/auth/signin'
      preLoaderRoute: typeof AuthSigninImport
      parentRoute: typeof rootRoute
    }
    '/__app/': {
      id: '/__app/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof appIndexImport
      parentRoute: typeof appImport
    }
  }
}

// Create and export the route tree

interface appRouteChildren {
  appSettingsRoute: typeof appSettingsRoute
  appIndexRoute: typeof appIndexRoute
}

const appRouteChildren: appRouteChildren = {
  appSettingsRoute: appSettingsRoute,
  appIndexRoute: appIndexRoute,
}

const appRouteWithChildren = appRoute._addFileChildren(appRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof appRouteWithChildren
  '/settings': typeof appSettingsRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
  '/': typeof appIndexRoute
}

export interface FileRoutesByTo {
  '/settings': typeof appSettingsRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
  '/': typeof appIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/__app': typeof appRouteWithChildren
  '/__app/settings': typeof appSettingsRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
  '/__app/': typeof appIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '' | '/settings' | '/auth/register' | '/auth/signin' | '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/settings' | '/auth/register' | '/auth/signin' | '/'
  id:
    | '__root__'
    | '/__app'
    | '/__app/settings'
    | '/auth/register'
    | '/auth/signin'
    | '/__app/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  appRoute: typeof appRouteWithChildren
  AuthRegisterRoute: typeof AuthRegisterRoute
  AuthSigninRoute: typeof AuthSigninRoute
}

const rootRouteChildren: RootRouteChildren = {
  appRoute: appRouteWithChildren,
  AuthRegisterRoute: AuthRegisterRoute,
  AuthSigninRoute: AuthSigninRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/__app",
        "/auth/register",
        "/auth/signin"
      ]
    },
    "/__app": {
      "filePath": "__app.tsx",
      "children": [
        "/__app/settings",
        "/__app/"
      ]
    },
    "/__app/settings": {
      "filePath": "__app.settings.tsx",
      "parent": "/__app"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx"
    },
    "/auth/signin": {
      "filePath": "auth/signin.tsx"
    },
    "/__app/": {
      "filePath": "__app.index.tsx",
      "parent": "/__app"
    }
  }
}
ROUTE_MANIFEST_END */
