import React, { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '../../app/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

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
  onClick?: () => void;
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  href: string;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const buttonVariants = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
  outline:
    'border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
} as const;

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

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
      buttonVariants[variant as keyof typeof buttonVariants],
      buttonSizes[size as keyof typeof buttonSizes],
      (loading || disabled) && 'pointer-events-none',
      className
    );

    const iconElement = loading ? (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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

    if ('href' in props && props.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={classes}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type || 'button'}
        onClick={props.onClick}
        disabled={disabled || loading}
        className={classes}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
