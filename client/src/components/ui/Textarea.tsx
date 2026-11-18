import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { FieldLabel, FieldMessage } from '@/components/ui/FieldParts';
import { fieldBase, fieldInvalid } from '@/lib/utils/field-styles';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, containerClassName, className, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(
    (value): value is string => value !== null,
  );

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? <FieldLabel htmlFor={textareaId}>{label}</FieldLabel> : null}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(fieldBase, 'min-h-28 resize-y py-3', error ? fieldInvalid : null, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
        {...props}
      />
      {hint ? <FieldMessage id={hintId}>{hint}</FieldMessage> : null}
      {error ? (
        <FieldMessage id={errorId} tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  );
});
