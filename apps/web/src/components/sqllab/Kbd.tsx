interface KbdProps {
  children: React.ReactNode;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Kbd({ children, className = "", ...rest }: KbdProps) {
  return (
    <kbd
      aria-hidden={rest["aria-hidden"]}
      className={`inline-flex min-w-[1.45rem] items-center justify-center rounded border border-white/30 bg-white/15 px-1 py-0.5 text-[10px] font-semibold leading-none ${className}`}
    >
      {children}
    </kbd>
  );
}
