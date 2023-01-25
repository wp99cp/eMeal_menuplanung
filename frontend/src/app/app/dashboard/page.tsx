import { getUser } from '@/util/session';

export default async function Page() {
  const user = await getUser();

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-2">
            <h1>Hello, App Dashboatd Page!</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>
    </>
  );
}
