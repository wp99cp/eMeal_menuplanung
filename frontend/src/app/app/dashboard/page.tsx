import { getUser } from '@/util/session';

export default async function Page() {
  const user = await getUser();

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div>
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 dark:border-gray-600 p-2">

            <h1 className="mb-6">
              Hello, App Dashboard Page!
            </h1>

            <pre className="text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>

          </div>
        </div>
      </div>
    </>
  );
}
