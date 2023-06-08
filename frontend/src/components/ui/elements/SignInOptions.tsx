import { CeviIcon } from '@/components/elements/Icons/CeviIcon';
import { PfadiIcon } from '@/components/elements/Icons/PfadiIcon';
import { GoogleIcon } from '@/components/elements/Icons/GoogleIcon';
import { Button } from '@ui/components/Button';
import { Provider } from '@/util/types/next-auth';

function SignInOptions({
  signInHandler = async (provider) =>
    console.log('SignIn not implemented! Would sign in with: ', provider),
}: {
  signInHandler?: (_: Provider) => Promise<void>;
}) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-3">
      <Button
        intent="stroked"
        onClick={() => signInHandler(Provider.CEVI_DB)}
        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit CeviDB anmelden</span>
        <CeviIcon />
      </Button>

      <Button
        intent="stroked"
        onClick={() => signInHandler(Provider.MI_DATA)}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit MiData anmelden</span>
        <PfadiIcon />
      </Button>

      <Button
        intent="stroked"
        onClick={() => signInHandler(Provider.GOOGLE)}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Mit Google anmelden</span>
        <GoogleIcon />
      </Button>
    </div>
  );
}

export default SignInOptions;
