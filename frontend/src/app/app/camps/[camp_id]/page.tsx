'use client';

import { useCampSubscription } from '@/util/generated/graphql/graphql';
import { getCookies } from 'cookies-next';

export default function Page({ params }: { params: { camp_id: string } }) {
  // subscribe to camp with camp_id
  const {
    data: camp,
    loading,
    error,
    variables,
  } = useCampSubscription({
    variables: { camp_id: params.camp_id },
    fetchPolicy: 'no-cache',
  });

  if (loading) return <div>Loading...</div>;

  if (error || !camp?.camp)
    return (
      <div>
        Error {error?.name}
        <br />
        {error?.message}
      </div>
    );

  // Render the list of camps
  return (
    <div>
      <h1>
        Camp with name <b>{camp.camp.name}</b>
      </h1>
      <p> - {camp.camp.id}</p>
    </div>
  );
}
