'use client';

import { useGetCampListQuery } from '@/util/generated/graphql/graphql';
import Link from 'next/link';

export default function Page() {
  const { loading, error, data: camps } = useGetCampListQuery();

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Render the list of camps
  return (
    <div>
      <h1>Camps</h1>
      <ul>
        {camps?.camps?.map((camp) => (
          <li key={camp?.id}>
            <Link href={`/app/camps/${camp?.id}`}>{camp?.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
