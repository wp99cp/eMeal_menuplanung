#### Usage of Prisma Extensions

As of Prisma 4.16.0, Prisma
supports [extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions). Extensions allow
to add custom functionality to the Prisma client. To follow common patterns, we have decided to not use such extensions
only for specific use cases:

- For logging and performance monitoring
- Implementing something like [soft delete](https://zenstack.dev/blog/prisma-client-extensions#1-soft-delete)
- Setting up change listeners for serving GraphQL subscriptions, e.g. we could hock into every write operation and
  trigger an update to all active subscriptions using pubsub.
- Enforcing access control

However, we do not plan to use extensions to implement business logic. For example, we will not use extensions for
implementing complex database transactions like adding a meal to a specific camp, implementing queries like fetching all
meals of a camp or for complex aggregations like creating the shopping list / week view of a camp, as those operations
are only used within a single graphql resolver.

::: warning
separate resolvers from business logic!!
:::
