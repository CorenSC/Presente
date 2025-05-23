import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { RxExit } from 'react-icons/rx';
import logoBranco from '../../../public/images/Corensc_branco.png';

const Navbar: React.FC = () => {
    const [menuAberto, setMenuAberto] = useState(false);
    const [rotaAtual, setRotaAtual] = useState('');

    useEffect(() => {
        setRotaAtual(window.location.pathname);
    }, []);

    const linkClass = (path: string) => (rotaAtual === path ? 'text-gray-500 font-black' : 'hover:text-gray-400 transition');

    // @ts-ignore
    return (
        <nav className="bg-primary sticky top-0 z-50 px-6 py-4 text-white shadow-md dark:bg-[#1B2C40]">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <Link href={route('dashboard')}>
                        <img src={logoBranco} alt="Imagem do Coren-SC" width="80" />
                    </Link>
                </div>

                {/* Menu desktop */}
                <ul className="hidden items-center space-x-6 text-sm text-white md:flex">
                    <li>
                        <Link href={route('dashboard')} className={linkClass('/dashboard')}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href={route('eventos')} className={linkClass('/eventos')}>
                            Eventos
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className={linkClass('/relatorios')}>
                            Relatórios
                        </Link>
                    </li>
                    <li>
                        <Link href={route('usuarios')} className={linkClass('/usuario')}>
                            Usuários
                        </Link>
                    </li>
                    <li>
                        <Link href={route('logout')} className={`${linkClass('/logout')} flex items-center gap-2`}>
                            Sair <RxExit />
                        </Link>
                    </li>
                </ul>

                {/* Botão mobile */}
                <div className="md:hidden">
                    <button onClick={() => setMenuAberto(!menuAberto)} className="text-white focus:outline-none">
                        {menuAberto ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            {menuAberto && (
                <div className="animate-fade-in-down mt-4 space-y-2 text-sm text-white flex flex-col md:hidden">
                    <a href="/dashboard" className={linkClass('/dashboard')}>
                        Dashboard
                    </a>
                    <a href="/eventos" className={linkClass('/eventos')}>
                        Eventos
                    </a>
                    <a href="/relatorios" className={linkClass('/relatorios')}>
                        Relatórios
                    </a>
                    <a href="/usuarios" className={linkClass('/usuarios')}>
                        Usuários
                    </a>
                    <a href="/logout" className={`${linkClass('/logout')} flex items-center gap-2`}>
                        Sair <RxExit />
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
