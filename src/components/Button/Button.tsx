import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

type ButtonVariant = 'blue' | 'red' | 'white';

type ButtonProps = {
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASS_MAP = {
  blue: 'bg-blue-500 text-white hover:bg-blue-600',
  red: 'bg-red-500 text-white hover:bg-red-600',
  white: 'bg-white text-slate-900 hover:bg-slate-50',
};

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  variant = 'blue',
  disabled,
  type = 'button',
  ...rest
}) => {
  const variantClass = VARIANT_CLASS_MAP[variant] || VARIANT_CLASS_MAP.blue;
  const baseClassName =
    'inline-flex items-center justify-center rounded-xs px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClassName} ${variantClass} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
