import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldLabel, FieldMessage } from '@/components/ui/FieldParts';
import { fieldBase, fieldInvalid } from '@/lib/utils/field-styles';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options?: readonly SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    placeholder,
    options,
    containerClassName,
    className,
    id,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(
    (value): value is string => value !== null,
  );

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? <FieldLabel htmlFor={selectId}>{label}</FieldLabel> : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            fieldBase,
            'h-11 cursor-pointer appearance-none pr-11',
            error ? fieldInvalid : null,
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
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
