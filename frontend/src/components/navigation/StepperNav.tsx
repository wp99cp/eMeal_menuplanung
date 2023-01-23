'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { usePathname, useSearchParams } from 'next/navigation';

interface StepperNavProps {
  steps: {
    id: string;
    name: string;
    step_name: string;
    status: string;
  }[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StepperNav({ steps }: StepperNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get('step') || steps[0].step_name;

  if (searchParams && steps.find((step) => step.step_name === currentStep)) {
    let hastFound = false;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].step_name === currentStep) {
        hastFound = true;
        steps[i].status = 'current';
      } else {
        steps[i].status = hastFound ? 'upcoming' : 'complete';
      }
    }
  }

  return (
    <nav aria-label="Progress" className="grid place-content-center">
      <ol role="list" className="flex">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative'
            )}
          >
            {step.status === 'complete' ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-accent-600" />
                </div>
                <a
                  href={pathname + '?step=' + step.step_name}
                  className="relative flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 hover:bg-accent-900"
                >
                  <CheckIcon
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : step.status === 'current' ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  href={pathname + '?step=' + step.step_name}
                  className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent-600 bg-white"
                  aria-current="step"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent-600"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  href={pathname + '?step=' + step.step_name}
                  className="group relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-gray-300"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
