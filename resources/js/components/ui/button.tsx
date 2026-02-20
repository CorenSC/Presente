import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "bg-primary hover:bg-primary-foreground text-white",
                destructive:
                    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
                // ✅ OUTLINE bonito
                outline:
                    "border border-primary/15 bg-primary/30 text-wihte shadow-sm hover:bg-primary/40 hover:border-primary/25 hover:shadow-md focus-visible:ring-white/20 active:scale-[0.99] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",

                // ✅ SECONDARY bonito
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.99] dark:bg-white/10 dark:text-white dark:hover:bg-white/15",

                // ✅ GHOST bonito
                ghost:
                    "bg-transparent text-primary hover:bg-black/10 hover:text-primary-foreground focus-visible:ring-white/15 active:scale-[0.99] dark:text-white dark:hover:bg-white/10",

                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            className={cn(
                buttonVariants({ variant, size, className }),
                // se você quiser manter seus estilos "globais", coloca aqui:
                "font-semibold cursor-pointer shadow-2xl active:scale-95 transition-all "
            )}
            {...props}
        />
    )
}

export { Button, buttonVariants }
