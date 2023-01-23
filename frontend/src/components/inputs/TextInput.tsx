interface TextInputProps {
  label?: string;
  id: string;
  name: string;
  type: string;
  description: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean | undefined;
}

const TextInput = ({
  id,
  name,
  type,
  autoComplete,
  description,
  required = false,
}: TextInputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {description}
      </label>
      <div className="mt-1">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-accent-500 sm:text-sm bg-gray-100"
        />
      </div>
    </div>
  );
};

export default TextInput;
