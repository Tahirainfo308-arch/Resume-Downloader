import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldMessage } from '@/components/ui/FieldParts';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, containerClassName, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className={cn('w-full', containerClassName)}>
      <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-line-strong bg-cream accent-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed',
            error ? 'border-rose' : null,
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={[description ? descriptionId : null, error ? errorId : null]
            .filter((value): value is string => value !== null)
            .join(' ')}
          {...props}
        />
        <span className="flex flex-col gap-1">
          <span className="text-sm font-medium text-dark">{label}</span>
          {description ? (
            <span id={descriptionId} className="text-xs leading-5 text-muted">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <FieldMessage id={errorId} tone="error" className="ml-8">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  );
});
