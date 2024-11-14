import { Link, createFileRoute } from '@tanstack/react-router'
import { Card } from '~/components/ui'
import { getBankAccounts } from '../../_app'

export const Route = createFileRoute('/_app/accounts/')({
  component: RouteComponent,
  loader: async () => {
    const bankAccounts = await getBankAccounts()
    return {
      bankAccounts,
    }
  },
})

function RouteComponent() {
  const { bankAccounts } = Route.useLoaderData()

  return (
    <div>
      <div className="flex flex-row gap-2">
        {bankAccounts.map((item) => (
          <Link
            key={item.id}
            to={'/accounts/$accountId'}
            params={{ accountId: item.id }}
          >
            <Card>
              <Card.Header>Plaid Items</Card.Header>
              <Card.Content>{item.name}</Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
