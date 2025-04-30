import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

function Input({ className, type, id, label, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      { label && (
        <span className="text-sm text-primary dark:text-white">
          {label}
        </span>
      )}
      <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent dark:bg-[#EBEBEB] px-3 py-1 text-base shadow-md transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      id={ id }
      {...props}
    />
    </label>
  )
}

export { Input }
