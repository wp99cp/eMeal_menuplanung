#### Usage of Prisma Extensions

As of Prisma 4.16.0, Prisma
supports [extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions). Extensions allow
to add custom functionality to the Prisma
client. To follow common patterns, we have decided to use such extensions only for selected and well-defined use cases.
Currently, we limit the usage of extensions to the following cases:

- for logging and performance monitoring
- implementing something like [soft delete](https://zenstack.dev/blog/prisma-client-extensions#1-soft-delete)
- setting up change listeners for serving GraphQL subscriptions

However, we do not plan to use extensions to implement business logic. For example, we will not use extensions for

- implementing complex database transactions like adding a meal to a specific camp,
- implementing queries like fetching all meals of a camp,
- for complex aggregations like creating the shopping list / week view of a camp,
- or for implementing complex authorization checks

as those operations are only used within a single graphql resolver and should be implemented in the business logic of
the resolver rather than on database level.
