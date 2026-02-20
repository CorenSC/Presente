import { cn } from '@/lib/utils';
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';
import * as React from 'react';

type AlertProps = React.ComponentProps<'div'> & {
    variant?: 'success' | 'error' | 'warning' | 'info';
};

function Alert({ variant = 'error', className, ...props }: AlertProps) {
    const variants = {
        success: 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-800/10 dark:border-green-900 dark:text-green-500',
        error: 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500',
        warning: 'bg-yellow-100 border border-yellow-300 text-yellow-800 dark:bg-yellow-800/10 dark:border-yellow-900 dark:text-yellow-500',
        info: 'bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-800/10 dark:border-blue-900 dark:text-blue-500',
    };
    return (
        <div className='w-full flex justify-center'>
            <div
                data-slot="alert"
                role="alert"
                className={cn(
                    'relative rounded-lg w-full lg:w-1/2 p-4 text-sm',
                    variants[variant],
                    className
                )}
                {...props}
            />
        </div>
    );
}

function AlertTitle({ className, variant='error', children, ...props }: AlertProps) {
    const icons = {
      success:  <CircleCheck />,
        error:  <CircleX />,
        warning: <TriangleAlert />,
        info: <Info />
    };

    // @ts-ignore
    return (
        <div data-slot="alert-title" className={cn('col-start-2 mb-4 flex items-center gap-2 font-bold tracking-tight', className)} {...props}>
            {icons[variant]}
            {children}
        </div>
    );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn('col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed', className)}
            {...props}
        />
    );
}

export { Alert, AlertDescription, AlertTitle };
