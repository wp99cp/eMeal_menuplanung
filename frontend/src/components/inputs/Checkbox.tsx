interface CheckboxProps {
  id: string;
  name: string;
  description: string;
  required?: boolean | undefined;
}

function Checkbox({ id, name, required = false, description }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        name={name}
        required={required}
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
