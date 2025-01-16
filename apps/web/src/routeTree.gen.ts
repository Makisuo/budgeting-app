/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthImport } from './routes/_auth'
import { Route as AppImport } from './routes/_app'
import { Route as AuthLayoutImport } from './routes/auth/layout'
import { Route as AppIndexImport } from './routes/_app/index'
import { Route as AuthVerifyEmailImport } from './routes/auth/verify-email'
import { Route as AuthTwoFactorImport } from './routes/auth/two-factor'
import { Route as AuthResetPasswordImport } from './routes/auth/reset-password'
import { Route as AuthForgotPasswordImport } from './routes/auth/forgot-password'
import { Route as AppSubscriptionsImport } from './routes/_app/subscriptions'
import { Route as AppSettingsImport } from './routes/_app/settings'
import { Route as AuthRegisterIndexImport } from './routes/auth/register/index'
import { Route as AuthLoginIndexImport } from './routes/auth/login/index'
import { Route as AppAccountsIndexImport } from './routes/_app/accounts/index'
import { Route as AppAccountsAccountIdImport } from './routes/_app/accounts/$accountId'

// Create/Update Routes

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/_app',
  getParentRoute: () => rootRoute,
} as any)

const AuthLayoutRoute = AuthLayoutImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const AppIndexRoute = AppIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AppRoute,
} as any)

const AuthVerifyEmailRoute = AuthVerifyEmailImport.update({
  id: '/verify-email',
  path: '/verify-email',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AuthTwoFactorRoute = AuthTwoFactorImport.update({
  id: '/two-factor',
  path: '/two-factor',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AuthResetPasswordRoute = AuthResetPasswordImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AuthForgotPasswordRoute = AuthForgotPasswordImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AppSubscriptionsRoute = AppSubscriptionsImport.update({
  id: '/subscriptions',
  path: '/subscriptions',
  getParentRoute: () => AppRoute,
} as any)

const AppSettingsRoute = AppSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AppRoute,
} as any)

const AuthRegisterIndexRoute = AuthRegisterIndexImport.update({
  id: '/register/',
  path: '/register/',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AuthLoginIndexRoute = AuthLoginIndexImport.update({
  id: '/login/',
  path: '/login/',
  getParentRoute: () => AuthLayoutRoute,
} as any)

const AppAccountsIndexRoute = AppAccountsIndexImport.update({
  id: '/accounts/',
  path: '/accounts/',
  getParentRoute: () => AppRoute,
} as any)

const AppAccountsAccountIdRoute = AppAccountsAccountIdImport.update({
  id: '/accounts/$accountId',
  path: '/accounts/$accountId',
  getParentRoute: () => AppRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthLayoutImport
      parentRoute: typeof rootRoute
    }
    '/_app': {
      id: '/_app'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/_app/settings': {
      id: '/_app/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof AppSettingsImport
      parentRoute: typeof AppImport
    }
    '/_app/subscriptions': {
      id: '/_app/subscriptions'
      path: '/subscriptions'
      fullPath: '/subscriptions'
      preLoaderRoute: typeof AppSubscriptionsImport
      parentRoute: typeof AppImport
    }
    '/auth/forgot-password': {
      id: '/auth/forgot-password'
      path: '/forgot-password'
      fullPath: '/auth/forgot-password'
      preLoaderRoute: typeof AuthForgotPasswordImport
      parentRoute: typeof AuthLayoutImport
    }
    '/auth/reset-password': {
      id: '/auth/reset-password'
      path: '/reset-password'
      fullPath: '/auth/reset-password'
      preLoaderRoute: typeof AuthResetPasswordImport
      parentRoute: typeof AuthLayoutImport
    }
    '/auth/two-factor': {
      id: '/auth/two-factor'
      path: '/two-factor'
      fullPath: '/auth/two-factor'
      preLoaderRoute: typeof AuthTwoFactorImport
      parentRoute: typeof AuthLayoutImport
    }
    '/auth/verify-email': {
      id: '/auth/verify-email'
      path: '/verify-email'
      fullPath: '/auth/verify-email'
      preLoaderRoute: typeof AuthVerifyEmailImport
      parentRoute: typeof AuthLayoutImport
    }
    '/_app/': {
      id: '/_app/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AppIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/accounts/$accountId': {
      id: '/_app/accounts/$accountId'
      path: '/accounts/$accountId'
      fullPath: '/accounts/$accountId'
      preLoaderRoute: typeof AppAccountsAccountIdImport
      parentRoute: typeof AppImport
    }
    '/_app/accounts/': {
      id: '/_app/accounts/'
      path: '/accounts'
      fullPath: '/accounts'
      preLoaderRoute: typeof AppAccountsIndexImport
      parentRoute: typeof AppImport
    }
    '/auth/login/': {
      id: '/auth/login/'
      path: '/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginIndexImport
      parentRoute: typeof AuthLayoutImport
    }
    '/auth/register/': {
      id: '/auth/register/'
      path: '/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterIndexImport
      parentRoute: typeof AuthLayoutImport
    }
  }
}

// Create and export the route tree

interface AuthLayoutRouteChildren {
  AuthForgotPasswordRoute: typeof AuthForgotPasswordRoute
  AuthResetPasswordRoute: typeof AuthResetPasswordRoute
  AuthTwoFactorRoute: typeof AuthTwoFactorRoute
  AuthVerifyEmailRoute: typeof AuthVerifyEmailRoute
  AuthLoginIndexRoute: typeof AuthLoginIndexRoute
  AuthRegisterIndexRoute: typeof AuthRegisterIndexRoute
}

const AuthLayoutRouteChildren: AuthLayoutRouteChildren = {
  AuthForgotPasswordRoute: AuthForgotPasswordRoute,
  AuthResetPasswordRoute: AuthResetPasswordRoute,
  AuthTwoFactorRoute: AuthTwoFactorRoute,
  AuthVerifyEmailRoute: AuthVerifyEmailRoute,
  AuthLoginIndexRoute: AuthLoginIndexRoute,
  AuthRegisterIndexRoute: AuthRegisterIndexRoute,
}

const AuthLayoutRouteWithChildren = AuthLayoutRoute._addFileChildren(
  AuthLayoutRouteChildren,
)

interface AppRouteChildren {
  AppSettingsRoute: typeof AppSettingsRoute
  AppSubscriptionsRoute: typeof AppSubscriptionsRoute
  AppIndexRoute: typeof AppIndexRoute
  AppAccountsAccountIdRoute: typeof AppAccountsAccountIdRoute
  AppAccountsIndexRoute: typeof AppAccountsIndexRoute
}

const AppRouteChildren: AppRouteChildren = {
  AppSettingsRoute: AppSettingsRoute,
  AppSubscriptionsRoute: AppSubscriptionsRoute,
  AppIndexRoute: AppIndexRoute,
  AppAccountsAccountIdRoute: AppAccountsAccountIdRoute,
  AppAccountsIndexRoute: AppAccountsIndexRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

export interface FileRoutesByFullPath {
  '/auth': typeof AuthLayoutRouteWithChildren
  '': typeof AuthRoute
  '/settings': typeof AppSettingsRoute
  '/subscriptions': typeof AppSubscriptionsRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/': typeof AppIndexRoute
  '/accounts/$accountId': typeof AppAccountsAccountIdRoute
  '/accounts': typeof AppAccountsIndexRoute
  '/auth/login': typeof AuthLoginIndexRoute
  '/auth/register': typeof AuthRegisterIndexRoute
}

export interface FileRoutesByTo {
  '/auth': typeof AuthLayoutRouteWithChildren
  '': typeof AuthRoute
  '/settings': typeof AppSettingsRoute
  '/subscriptions': typeof AppSubscriptionsRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/': typeof AppIndexRoute
  '/accounts/$accountId': typeof AppAccountsAccountIdRoute
  '/accounts': typeof AppAccountsIndexRoute
  '/auth/login': typeof AuthLoginIndexRoute
  '/auth/register': typeof AuthRegisterIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/auth': typeof AuthLayoutRouteWithChildren
  '/_app': typeof AppRouteWithChildren
  '/_auth': typeof AuthRoute
  '/_app/settings': typeof AppSettingsRoute
  '/_app/subscriptions': typeof AppSubscriptionsRoute
  '/auth/forgot-password': typeof AuthForgotPasswordRoute
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/auth/two-factor': typeof AuthTwoFactorRoute
  '/auth/verify-email': typeof AuthVerifyEmailRoute
  '/_app/': typeof AppIndexRoute
  '/_app/accounts/$accountId': typeof AppAccountsAccountIdRoute
  '/_app/accounts/': typeof AppAccountsIndexRoute
  '/auth/login/': typeof AuthLoginIndexRoute
  '/auth/register/': typeof AuthRegisterIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/auth'
    | ''
    | '/settings'
    | '/subscriptions'
    | '/auth/forgot-password'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/'
    | '/accounts/$accountId'
    | '/accounts'
    | '/auth/login'
    | '/auth/register'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/auth'
    | ''
    | '/settings'
    | '/subscriptions'
    | '/auth/forgot-password'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/'
    | '/accounts/$accountId'
    | '/accounts'
    | '/auth/login'
    | '/auth/register'
  id:
    | '__root__'
    | '/auth'
    | '/_app'
    | '/_auth'
    | '/_app/settings'
    | '/_app/subscriptions'
    | '/auth/forgot-password'
    | '/auth/reset-password'
    | '/auth/two-factor'
    | '/auth/verify-email'
    | '/_app/'
    | '/_app/accounts/$accountId'
    | '/_app/accounts/'
    | '/auth/login/'
    | '/auth/register/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthLayoutRoute: typeof AuthLayoutRouteWithChildren
  AppRoute: typeof AppRouteWithChildren
  AuthRoute: typeof AuthRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthLayoutRoute: AuthLayoutRouteWithChildren,
  AppRoute: AppRouteWithChildren,
  AuthRoute: AuthRoute,
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
        "/auth",
        "/_app",
        "/_auth"
      ]
    },
    "/auth": {
      "filePath": "auth/layout.tsx",
      "children": [
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/two-factor",
        "/auth/verify-email",
        "/auth/login/",
        "/auth/register/"
      ]
    },
    "/_app": {
      "filePath": "_app.tsx",
      "children": [
        "/_app/settings",
        "/_app/subscriptions",
        "/_app/",
        "/_app/accounts/$accountId",
        "/_app/accounts/"
      ]
    },
    "/_auth": {
      "filePath": "_auth.tsx"
    },
    "/_app/settings": {
      "filePath": "_app/settings.tsx",
      "parent": "/_app"
    },
    "/_app/subscriptions": {
      "filePath": "_app/subscriptions.tsx",
      "parent": "/_app"
    },
    "/auth/forgot-password": {
      "filePath": "auth/forgot-password.tsx",
      "parent": "/auth"
    },
    "/auth/reset-password": {
      "filePath": "auth/reset-password.tsx",
      "parent": "/auth"
    },
    "/auth/two-factor": {
      "filePath": "auth/two-factor.tsx",
      "parent": "/auth"
    },
    "/auth/verify-email": {
      "filePath": "auth/verify-email.tsx",
      "parent": "/auth"
    },
    "/_app/": {
      "filePath": "_app/index.tsx",
      "parent": "/_app"
    },
    "/_app/accounts/$accountId": {
      "filePath": "_app/accounts/$accountId.tsx",
      "parent": "/_app"
    },
    "/_app/accounts/": {
      "filePath": "_app/accounts/index.tsx",
      "parent": "/_app"
    },
    "/auth/login/": {
      "filePath": "auth/login/index.tsx",
      "parent": "/auth"
    },
    "/auth/register/": {
      "filePath": "auth/register/index.tsx",
      "parent": "/auth"
    }
  }
}
ROUTE_MANIFEST_END */
