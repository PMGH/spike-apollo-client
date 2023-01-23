This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Apollo Client with GraphQL

#### Getting Started
https://www.apollographql.com/blog/apollo-client/next-js/next-js-getting-started/

- Add `ApolloProvider` around _app.tsx root element
- Setup `ApolloClient` and pass it as a prop to `ApolloProvider`
- Use instance of `ApolloClient` to make requests (can do this in `getStaticProps` too)

#### Hooks
Fetch using the `useQuery` hook. Apollo tracks loading and error states for us.

```typescript
import { gql, useQuery } from '@apollo/client';

const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`;
```
```typescript
function Dogs({ onDogSelected }) {
  const { loading, error, data } = useQuery(GET_DOGS);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <select name='dog' onChange={onDogSelected}>
      {data.dogs.map((dog) => (
        <option key={dog.id} value={dog.breed}>
          {dog.breed}
        </option>
      ))}
    </select>
  );
}
```


#### Caching
When Apollo Client fetches query results from our server, it automatically caches those results locally.
```typescript
const GET_DOG_PHOTO = gql`
  query Dog($breed: String!) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

function DogPhoto({ breed }) {
  const { loading, error, data } = useQuery(GET_DOG_PHOTO, {
    variables: { breed },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return (
    <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />
  );
}
```

We can add the `pollInterval` option to `useQuery` to set the cache for that query to be stale after `x` milliseconds. It doesn't look like it refetches when a user switches tab (e.g. like SWR or React Query).

We can refetch by calling the `refetch` function that is returned by `useQuery`. E.g.
```typescript
function DogPhoto({ breed }) {
  const { loading, error, data, refetch } = useQuery(GET_DOG_PHOTO, {
    variables: { breed },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return (
    <div>
      <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />
      <button onClick={() => refetch({ breed: 'new_dog_breed' })}>
        Refetch new breed!
      </button>
    </div>
  );
}
```
> use `notifyOnNetworkStatusChange: true` to have the component re-render while data is being refetched. This is useful to make sure the `loading` value updates accordingly.

#### Error handling
If you set `errorPolicy` to `all`, `useQuery` does not discard query response data, allowing you to render partial results.

#### Manual Query Execution
Use `useLazyQuery` if you want to execute a query based on a user action only.

#### Cache-first policy
By default, the `useQuery` hook checks the Apollo Client cache to see if all the data you requested is already available locally. If all data is available locally, `useQuery` returns that data and doesn't query your GraphQL server. This cache-first policy is Apollo Client's default fetch policy.
> You can also apply a `nextFetchPolicy` if you want it to be different from the first fetch policy e.g. cache-only.

#### Devtools
An Apollo Client Devtools exists as a [Chrome extension](https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm) (rated 3/5 stars)

#### Subscriptions
Subscriptions are long lasting operations that can change their result over time. Maintains an active connection to your GraphQL server (most commonly via WebSocket) enabling the server to push updates to your app.
Common use case is for a chat application.

#### Fragments
```typescript
fragment NameParts on Person {
  firstName
  lastName
}
```
```typescript
query GetPerson {
  people(id: "7") {
    ...NameParts
    avatar(size: LARGE)
  }
}
```

#### Error handling
- syntax errors
- validation errors
- resolver errors
> Partial data can still be returned for resolver errors.
> By default, Apollo Client throws away partial data and populates the `error.graphQLErrors` array of your `useQuery` call (or whichever hook you're using). You can instead use these partial results by defining an error policy for your operation.

You can provide an `errorPolicy` to the `useQuery` hook. (e.g. 'none', 'ignore', 'all').

#### Pagination
https://www.apollographql.com/docs/react/pagination/overview

Call the `fetchMore` function to fetch the next page. Which is useful for programmatic fetching e.g. for infinite scroll

#### Typescript
https://www.apollographql.com/docs/react/development-testing/static-typing

#### Testing
https://www.apollographql.com/docs/react/development-testing/testing
https://www.apollographql.com/docs/react/api/react/testing

#### Prefetching
https://www.apollographql.com/docs/react/performance/performance#prefetching-data

#### SSR
https://www.apollographql.com/docs/react/performance/server-side-rendering
https://www.apollographql.com/docs/react/api/react/ssr
```typescript
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';

const client = new ApolloClient({
  ssrMode: true,
  link: createHttpLink({
    uri: 'http://localhost:3010',
    credentials: 'same-origin',
    headers: {
      cookie: req.header('Cookie'),
    },
  }),
  cache: new InMemoryCache(),
});
```
Use the `ssrMode` to prevent refetching queries unnecessarily.

#### Auth: including credentials in requests
https://www.apollographql.com/docs/react/networking/basic-http-networking#including-credentials-in-requests
```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.example.com',
  cache: new InMemoryCache(),
  // Enable sending cookies over cross-origin requests
  credentials: 'include'
});
```

#### React Hooks
https://www.apollographql.com/docs/react/api/react/hooks
- ApolloProvider
- ApolloConsumer
- useQuery
- useLazyQuery
- useMutation
- useSubscription
- useApolloClient
- useReactiveVar
