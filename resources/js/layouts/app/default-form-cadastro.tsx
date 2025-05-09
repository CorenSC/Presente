import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';
import logoBranco from '../../../../public/images/Corensc_branco.png';

type DefaultLayoutProps = {
    children: ReactNode;
    className?: string;
};

export default function DefaultFormCadastro({ children, className }: DefaultLayoutProps) {
    return (
        <div className={cn('flex min-h-screen w-full flex-col bg-[#EBEBEB] text-white dark:bg-[#101524]')}>
            <nav className="bg-primary sticky top-0 z-50 px-6 py-4 text-white shadow-md dark:bg-[#1B2C40]">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center justify-center space-x-2 w-full">
                        <img src={logoBranco} alt="Imagem do Coren-SC" width="120" />
                    </div>
                </div>
            </nav>


            <main className={cn('flex-grow p-6', className)}>{children}</main>
            <footer className="bg-primary px-6 py-4 text-center text-sm text-white dark:bg-[#1B2C40]">
                © {new Date().getFullYear()} Coren-SC | Todos os direitos reservados.
            </footer>
        </div>
    );
}
