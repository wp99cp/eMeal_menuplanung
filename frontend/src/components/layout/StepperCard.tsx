'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/layout/Card';
import { PrimaryButton } from '@/components/elements/Buttons/PrimaryButton';
import { CheckIcon } from '@heroicons/react/24/solid';
import { StrokedButton } from '@/components/elements/Buttons/StrokedButton';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

export interface StepperCardSteps<T> {
  name: string;
  step_name: string;
  step_action: (args: T) => Promise<boolean> | boolean;
  content: (args: T) => JSX.Element;
}

export interface StepperCardSettings<T> {
  step_fnc_args: T;

  stepper_nav_config: {
    first_nav: { forwards_button_name: string };
    middle_nav: { backwards_button_name: string; forwards_button_name: string };
    last_nav: {
      backwards_button_name: string;
      forwards_button_name: string;
      continuation_link: string;
    };
  };
}

interface StepperCardProps<T> {
  settings: StepperCardSettings<T>;
  steps: StepperCardSteps<T>[];
}

const step_forward = (
  steps: StepperCardSteps<any>[],
  index: number,
  settings: StepperCardSettings<any>,
  baseUrl: string | null,
  router: AppRouterInstance
) => {
  return async () => {
    (await steps[index].step_action(settings.step_fnc_args))
      ? router.push(baseUrl + steps[index + 1]?.step_name)
      : null;
  };
};

const continuation_step = (
  steps: StepperCardSteps<any>[],
  index: number,
  settings: StepperCardSettings<any>,
  router: AppRouterInstance
) => {
  return async () => {
    await steps[index].step_action(settings.step_fnc_args);
    router.push(settings.stepper_nav_config.last_nav.continuation_link);
  };
};

const render_nav_buttons = (
  index: number,
  steps: StepperCardSteps<any>[],
  settings: StepperCardSettings<any>,
  baseUrl: string,
  router: AppRouterInstance
) => {
  if (index === 0) {
    return (
      <>
        <PrimaryButton onClick={step_forward(steps, index, settings, baseUrl, router)}>
          {settings.stepper_nav_config.first_nav.forwards_button_name}
        </PrimaryButton>
      </>
    );
  }

  if (index === steps.length - 1) {
    return (
      <>
        <StrokedButton
          onClick={async () => {
            await router.push(baseUrl + steps[index - 1]?.step_name);
          }}
        >
          {settings.stepper_nav_config.last_nav.backwards_button_name}
        </StrokedButton>
        <PrimaryButton onClick={continuation_step(steps, index, settings, router)}>
          {settings.stepper_nav_config.last_nav.forwards_button_name}
        </PrimaryButton>
      </>
    );
  }

  return (
    <>
      <StrokedButton
        onClick={async () => {
          await router.push(baseUrl + steps[index - 1]?.step_name);
        }}
      >
        {settings.stepper_nav_config.middle_nav.backwards_button_name}
      </StrokedButton>
      <PrimaryButton onClick={step_forward(steps, index, settings, baseUrl, router)}>
        {settings.stepper_nav_config.middle_nav.forwards_button_name}
      </PrimaryButton>
    </>
  );
};

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const render_completed_step = (
  baseUrl: string,
  steps: StepperCardSteps<any>[],
  stepIdx: number,
  step: StepperCardSteps<any>,
  router: AppRouterInstance
) => {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-accent-600" />
      </div>
      <div
        onClick={async () => {
          await router.push(baseUrl + steps[stepIdx]?.step_name);
        }}
        className="relative flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 hover:bg-accent-900"
      >
        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
        <span className="sr-only">{step.name}</span>
      </div>
    </>
  );
};

const render_current_step = (step: StepperCardSteps<any>) => {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div
        className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent-600 bg-white"
        aria-current="step"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent-600" aria-hidden="true" />
        <span className="sr-only">{step.name}</span>
      </div>
    </>
  );
};

const render_upcoming_step = (step: StepperCardSteps<any>) => {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div className="group relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
        <span className="h-1.5 w-1.5 rounded-full bg-transparent" aria-hidden="true" />
        <span className="sr-only">{step.name}</span>
      </div>
    </>
  );
};

const render_step_overview = (
  steps: StepperCardSteps<any>[],
  index: number,
  baseUrl: string,
  router: AppRouterInstance
) => {
  return (
    <>
      {steps.map((step, stepIdx) => (
        <li
          key={step.name}
          className={classNames(
            stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
            'relative'
          )}
        >
          {stepIdx < index
            ? render_completed_step(baseUrl, steps, stepIdx, step, router)
            : stepIdx == index
            ? render_current_step(step)
            : render_upcoming_step(step)}
        </li>
      ))}
    </>
  );
};

const StepperCard = ({ steps, settings: settings }: StepperCardProps<any>) => {
  const searchParams = useSearchParams();
  const currentStep = searchParams.get('step') || steps[0].step_name;

  const index = steps.findIndex((step) => step.step_name === currentStep);

  let baseUrl = usePathname() || '';
  baseUrl += '?step=';

  const router = useRouter();

  return (
    <>
      <div className="my-8 mx-4">
        <Card>
          <div className="my-6">
            <nav aria-label="Progress" className="grid place-content-center">
              <ol role="list" className="flex">
                {render_step_overview(steps, index, baseUrl, router)}
              </ol>
            </nav>{' '}
          </div>

          {steps[index].content(settings.step_fnc_args)}

          <span className="mt-10 flex space-x-4">
            {render_nav_buttons(index, steps, settings, baseUrl, router)}
          </span>
        </Card>
      </div>
    </>
  );
};

export default StepperCard;
