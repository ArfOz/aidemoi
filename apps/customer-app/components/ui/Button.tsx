'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

interface ButtonAsButtonProps extends BaseButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  href: string;
  type?: never;
  onClick?: never;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
  outline:
    'border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      className,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const classes = cn(
      baseClasses,
      buttonVariants[variant],
      buttonSizes[size],
      (loading || disabled) && 'pointer-events-none aria-disabled:opacity-50',
      className
    );

    const iconElement = loading ? (
      <svg
        className="animate-spin h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : (
      icon
    );

    const content = (
      <>
        {iconElement && iconPosition === 'left' && iconElement}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
        {iconElement && iconPosition === 'right' && iconElement}
      </>
    );

    // Link case
    if ('href' in props && props.href) {
      if (disabled || loading) {
        // Render a non-interactive element when disabled/loading
        return (
          <span className={classes} aria-disabled="true">
            {content}
          </span>
        );
      }
      return (
        <Link href={props.href} className={classes} aria-disabled={undefined}>
          {content}
        </Link>
      );
    }

    // Button case
    const buttonProps = props as ButtonAsButtonProps;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type || 'button'}
        onClick={buttonProps.onClick}
        disabled={disabled || loading}
        className={classes}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
