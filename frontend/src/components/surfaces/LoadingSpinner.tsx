import { ArrowPathIcon } from '@heroicons/react/20/solid';

export const LoadingSpinner = () => {
  return (
    <>
      <div className="grid h-48">
        <h3 className="my-6 block text-center text-lg font-bold text-gray-500">
          Bitte habe einen Moment Geduld
        </h3>

        <div className="grid grid-cols-1">
          <ArrowPathIcon className=" mx-auto h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    </>
  );
};
