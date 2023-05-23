type TextChild = string | boolean | undefined | null;

interface DividerProps {
  children?: TextChild;
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="relative my-6 flex">
      <div className="left-0 top-1/2 h-[1px] w-1/2 bg-gray-300"></div>

      {children && (
        <div className="relative flex justify-center text-sm">
          <span className="relative z-10 mt-[-9px] whitespace-nowrap px-2 text-gray-500">
            {children}
          </span>
        </div>
      )}

      <div className="right-0 top-1/2 h-[1px] w-1/2 bg-gray-300"></div>
    </div>
  );
}
