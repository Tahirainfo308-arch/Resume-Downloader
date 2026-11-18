import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { fieldLabel, fieldMessage } from '@/lib/utils/field-styles';
import { cn } from '@/lib/utils/cn';

export function FieldLabel({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn(fieldLabel, className)} {...props}>
      {children}
    </label>
  );
}

interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  tone?: 'hint' | 'error';
}

export function FieldMessage({ className, children, tone = 'hint', ...props }: FieldMessageProps) {
  return (
    <p
      className={cn(fieldMessage, tone === 'error' ? 'text-dark' : 'text-muted', className)}
      {...props}
    >
      {tone === 'error' ? (
        <AlertCircle aria-hidden="true" className="mr-1 inline-block text-rose" size={13} />
      ) : null}
      {children}
    </p>
  );
}
