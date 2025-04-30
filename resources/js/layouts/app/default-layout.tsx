import NavMain from '@/components/nav-main';
import { ReactNode } from 'react';

type DefaultLayoutProps = {
    children: ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        <div className="min-h-screen min-w-full bg-[#EBEBEB] dark:bg-[#101524] text-white">
            <NavMain />
            <main className="p-6">{children}</main>
        </div>
    );
}
