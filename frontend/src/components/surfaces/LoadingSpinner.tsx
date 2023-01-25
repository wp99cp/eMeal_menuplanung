import { ArrowPathIcon } from '@heroicons/react/20/solid';

export const LoadingSpinner = () => {
  return (
    <>
      <div className="h-48 grid">
        <h3 className="block text-lg font-bold text-gray-500 my-6 text-center">
          Bitte habe einen Moment Geduld
        </h3>

        <div className="grid grid-cols-1">
          <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
        </div>
      </div>
    </>
  );
};
