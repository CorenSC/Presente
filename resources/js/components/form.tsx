import React, { FormHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type FormProps = {
    children: React.ReactNode;
    className?: string;
} & FormHTMLAttributes<HTMLFormElement>;


export default function Form({children, className, ...props}: FormProps) {
    return (
        <div className={'flex flex-col p-3 rounded-md shadow-md bg-white w-[95%] md:p-4 md:w-1/2 dark:bg-gray-800'}>
            <form className={cn('flex flex-col gap-4', className)} {...props}>{children}</form>
        </div>
    );
}
