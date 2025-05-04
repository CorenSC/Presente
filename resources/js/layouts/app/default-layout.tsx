import NavMain from '@/components/nav-main';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DefaultLayoutProps = {
    children: ReactNode;
    className?:string;
};

export default function DefaultLayout({ children, className }: DefaultLayoutProps ) {
    return (
        <div className={cn("min-h-screen w-full flex flex-col bg-[#EBEBEB] dark:bg-[#101524] text-white")}>
            <NavMain />
            <main className={cn("flex-grow p-6", className)}>{children}</main>
            <footer className="bg-primary text-white text-sm py-4 px-6 text-center dark:bg-[#1B2C40]">
                © {new Date().getFullYear()} Coren-SC | Todos os direitos reservados.
            </footer>
        </div>
    );
}
