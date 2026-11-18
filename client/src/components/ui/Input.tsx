import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldLabel, FieldMessage } from '@/components/ui/FieldParts';
import { fieldBase, fieldInvalid } from '@/lib/utils/field-styles';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, trailingIcon, containerClassName, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(
    (value): value is string => value !== null,
  );

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <div className="relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            'h-11',
            leadingIcon ? 'pl-11' : null,
            trailingIcon ? 'pr-11' : null,
            error ? fieldInvalid : null,
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          {...props}
        />
        {trailingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            {trailingIcon}
          </span>
        ) : null}
      </div>
      {hint ? <FieldMessage id={hintId}>{hint}</FieldMessage> : null}
      {error ? (
        <FieldMessage id={errorId} tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  );
});
