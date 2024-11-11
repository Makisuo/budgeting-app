/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as AuthSigninImport } from './routes/auth/signin'
import { Route as AuthRegisterImport } from './routes/auth/register'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
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

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
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
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/auth/register': typeof AuthRegisterRoute
  '/auth/signin': typeof AuthSigninRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/auth/register' | '/auth/signin'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/auth/register' | '/auth/signin'
  id: '__root__' | '/' | '/auth/register' | '/auth/signin'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthRegisterRoute: typeof AuthRegisterRoute
  AuthSigninRoute: typeof AuthSigninRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
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
        "/",
        "/auth/register",
        "/auth/signin"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx"
    },
    "/auth/signin": {
      "filePath": "auth/signin.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
