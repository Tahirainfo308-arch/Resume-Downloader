import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { buttonClassName, type ButtonSize, type ButtonVariant } from '@/lib/utils/button-styles';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    isLoading = false,
    className,
    children,
    type = 'button',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClassName({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
      ) : (
        leadingIcon
      )}
      {children}
      {!isLoading ? trailingIcon : null}
    </button>
  );
});

type PresetButtonProps = Omit<ButtonProps, 'variant'>;

export const PrimaryButton = forwardRef<HTMLButtonElement, PresetButtonProps>(
  function PrimaryButton(props, ref) {
    return <Button ref={ref} variant="primary" {...props} />;
  },
);

export const SecondaryButton = forwardRef<HTMLButtonElement, PresetButtonProps>(
  function SecondaryButton(props, ref) {
    return <Button ref={ref} variant="secondary" {...props} />;
  },
);

export const OutlineButton = forwardRef<HTMLButtonElement, PresetButtonProps>(
  function OutlineButton(props, ref) {
    return <Button ref={ref} variant="outline" {...props} />;
  },
);
