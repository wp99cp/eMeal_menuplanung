import logo from '../../assets/logo.svg';
import Image from 'next/image';

export const Footer = () => {
  const today = new Date();

  return (
    <>
      <footer>
        <div className="mx-auto mt-32 w-full max-w-container px-4 sm:px-6 lg:px-8 bg-gray-200  py-10">
          <Image
            src={logo}
            alt="Logo Cevi.Tools"
            className="mx-auto h-12 w-auto text-slate-900"
          />
        </div>
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 bg-gray-800 p-6">
          <p className="text-center text-sm leading-6 text-gray-400">
            © {today.getFullYear()} Cevi.Tools - eMeal Menüplanung
          </p>
        </div>
      </footer>
    </>
  );
};
