import { Dispatch, SetStateAction } from 'react';

interface CheckboxProps {
  id: string;
  name: string;
  description: string;
  required?: boolean | undefined;
  stateHook?: [boolean, Dispatch<SetStateAction<boolean>>];
}

function Checkbox({
  id,
  name,
  required = false,
  description,
  stateHook: [inputValue, setInputValue] = [false, () => {}],
}: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        name={name}
        required={required}
        defaultChecked={inputValue}
        onChange={(event) => setInputValue(event.target.checked)}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {description}
      </label>
    </div>
  );
}

export default Checkbox;
