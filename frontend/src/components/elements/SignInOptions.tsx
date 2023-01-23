import { StrokedButton } from '@/components/elements/Buttons/StrokedButton';
import { CeviIcon } from '@/components/elements/Icons/CeviIcon';
import { PfadiIcon } from '@/components/elements/Icons/PfadiIcon';
import { GoogleIcon } from '@/components/elements/Icons/GoogleIcon';
import { signIn } from 'next-auth/react';

function SignInOptions() {
  return (
    <div className="mt-2 grid grid-cols-3 gap-3">
      <StrokedButton
        onClick={() => signIn('cevi-db')}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit CeviDB anmelden</span>
        <CeviIcon />
      </StrokedButton>

      <StrokedButton
        onClick={() => signIn('mi-data')}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit MiData anmelden</span>
        <PfadiIcon />
      </StrokedButton>

      <StrokedButton
        onClick={() => signIn('google')}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit Google anmelden</span>
        <GoogleIcon />
      </StrokedButton>
    </div>
  );
}

export default SignInOptions;
