import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__app/subscriptions')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /__app/subscriptions!'
}
