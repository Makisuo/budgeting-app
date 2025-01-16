/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AboutImport } from './routes/about'
import { Route as AppImport } from './routes/_app'
import { Route as IndexImport } from './routes/index'
import { Route as AuthVerifyEmailImport } from './routes/auth/verify-email'
import { Route as AuthTwoFactorImport } from './routes/auth/two-factor'
import { Route as AuthResetPasswordImport } from './routes/auth/reset-password'
import { Route as AuthLayoutImport } from './routes/auth/layout'
import { Route as AuthForgotPasswordImport } from './routes/auth/forgot-password'
import { Route as AuthRegisterIndexImport } from './routes/auth/register/index'
import { Route as AuthLoginIndexImport } from './routes/auth/login/index'

// Create/Update Routes

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/_app',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthVerifyEmailRoute = AuthVerifyEmailImport.update({
  id: '/auth/verify-email',
  path: '/auth/verify-email',
  getParentRoute: () => rootRoute,
} as any)

const AuthTwoFactorRoute = AuthTwoFactorImport.update({
  id: '/auth/two-factor',
  path: '/auth/two-factor',
  getParentRoute: () => rootRoute,
} as any)

const AuthResetPasswordRoute = AuthResetPasswordImport.update({
  id: '/auth/reset-password',
  path: '/auth/reset-password',
  getParentRoute: () => rootRoute,
} as any)

const AuthLayoutRoute = AuthLayoutImport.update({
  id: '/auth/layout',
  path: '/auth/layout',
  getParentRoute: () => rootRoute,
} as any)

const AuthForgotPasswordRoute = AuthForgotPasswordImport.update({
  id: '/auth/forgot-password',
  path: '/auth/forgot-password',
  getParentRoute: () => rootRoute,
} as any)

const AuthRegisterIndexRoute = AuthRegisterIndexImport.update({
  id: '/auth/register/',
  path: '/auth/register/',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginIndexRoute = AuthLoginIndexImport.update({
  id: '/auth/login/',
  path: '/auth/login/',
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
    '/_app': {
      id: '/_app'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/auth/forgot-password': {
      id: '/auth/forgot-password'
      path: '/auth/forgot-password'
      fullPath: '/auth/forgot-password'
      preLoaderRoute: typeof AuthForgotPasswordImport
      parentRoute: typeof rootRoute
    }
    '/auth/layout': {
      id: '/auth/layout'
      path: '/auth/layout'
      fullPath: '/auth/layout'
      preLoaderRoute: typeof AuthLayoutImport
      parentRoute: typeof rootRoute
    }
    '/auth/reset-password': {
      id: '/auth/reset-password'
      path: '/auth/reset-password'
      fullPath: '/auth/reset-password'
      preLoaderRoute: typeof AuthResetPasswordImport
      parentRoute: typeof rootRoute
    }
    '/auth/two-factor': {
      id: '/auth/two-factor'
      path: '/auth/two-factor'
      fullPath: '/auth/two-factor'
      preLoaderRoute: typeof AuthTwoFactorImport
      parentRoute: typeof rootRoute
    }
    '/auth/verify-email': {
      id: '/auth/verify-email'
      path: '/auth/verify-email'
      fullPath: '/auth/verify-email'
      preLoaderRoute: typeof AuthVerifyEmailImport
      parentRoute: typeof rootRoute
    }
    '/auth/login/': {
      id: '/auth/login/'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginIndexImport
      parentRoute: typeof rootRoute
    }
    '/auth/register/': {
      id: '/auth/register/'
      path: '/auth/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AppRoute
  '/about': typeof AboutRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/layout': typeof AuthLayoutRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/auth/login': typeof AuthLoginIndexRoute
  '/auth/register': typeof AuthRegisterIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AppRoute
  '/about': typeof AboutRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/layout': typeof AuthLayoutRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/auth/login': typeof AuthLoginIndexRoute
  '/auth/register': typeof AuthRegisterIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_app': typeof AppRoute
  '/about': typeof AboutRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/layout': typeof AuthLayoutRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/auth/login/': typeof AuthLoginIndexRoute
  '/auth/register/': typeof AuthRegisterIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/about'
    | '/auth/forgot-password'
    | '/auth/layout'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/auth/login'
    | '/auth/register'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/about'
    | '/auth/forgot-password'
    | '/auth/layout'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/auth/login'
    | '/auth/register'
  id:
    | '__root__'
    | '/'
    | '/_app'
    | '/about'
    | '/auth/forgot-password'
    | '/auth/layout'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/auth/login/'
    | '/auth/register/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppRoute: typeof AppRoute
  AboutRoute: typeof AboutRoute
  AuthForgotPasswordRoute: typeof AuthForgotPasswordRoute
  AuthLayoutRoute: typeof AuthLayoutRoute
  AuthResetPasswordRoute: typeof AuthResetPasswordRoute
  AuthTwoFactorRoute: typeof AuthTwoFactorRoute
  AuthVerifyEmailRoute: typeof AuthVerifyEmailRoute
  AuthLoginIndexRoute: typeof AuthLoginIndexRoute
  AuthRegisterIndexRoute: typeof AuthRegisterIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AppRoute: AppRoute,
  AboutRoute: AboutRoute,
  AuthForgotPasswordRoute: AuthForgotPasswordRoute,
  AuthLayoutRoute: AuthLayoutRoute,
  AuthResetPasswordRoute: AuthResetPasswordRoute,
  AuthTwoFactorRoute: AuthTwoFactorRoute,
  AuthVerifyEmailRoute: AuthVerifyEmailRoute,
  AuthLoginIndexRoute: AuthLoginIndexRoute,
  AuthRegisterIndexRoute: AuthRegisterIndexRoute,
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
        "/_app",
        "/about",
        "/auth/forgot-password",
        "/auth/layout",
        "/auth/reset-password",
        "/auth/two-factor",
        "/auth/verify-email",
        "/auth/login/",
        "/auth/register/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_app": {
      "filePath": "_app.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/auth/forgot-password": {
      "filePath": "auth/forgot-password.tsx"
    },
    "/auth/layout": {
      "filePath": "auth/layout.tsx"
    },
    "/auth/reset-password": {
      "filePath": "auth/reset-password.tsx"
    },
    "/auth/two-factor": {
      "filePath": "auth/two-factor.tsx"
    },
    "/auth/verify-email": {
      "filePath": "auth/verify-email.tsx"
    },
    "/auth/login/": {
      "filePath": "auth/login/index.tsx"
    },
    "/auth/register/": {
      "filePath": "auth/register/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
