import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoBranco from '../../../public/images/Corensc_branco.png';

const Navbar: React.FC = () => {
    const [menuAberto, setMenuAberto] = useState(false);
    const [rotaAtual, setRotaAtual] = useState("");

    useEffect(() => {
        setRotaAtual(window.location.pathname);
    }, []);

    const linkClass = (path: string) =>
        rotaAtual === path
            ? "text-indigo-400 font-semibold"
            : "hover:text-indigo-600 transition";

    return (
        <nav className="bg-[#214064] dark:bg-[#1B2C40] text-white shadow-md px-6 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <img src={logoBranco} alt="Imagem do Coren-SC" width='80'/>
                </div>

                {/* Menu desktop */}
                <ul className="hidden md:flex items-center space-x-6 text-sm text-white">
                    <li><a href="/dashboard" className={linkClass("/dashboard")}>Dashboard</a></li>
                    <li><a href="/eventos" className={linkClass("/eventos")}>Eventos</a></li>
                    <li><a href="/relatorios" className={linkClass("/relatorios")}>Relatórios</a></li>
                    <li><a href="/logout" className={linkClass("/logout")}>Sair</a></li>
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
                <div className="md:hidden mt-4 space-y-2 text-sm text-white animate-fade-in-down">
                    <a href="/dashboard" className={linkClass("/dashboard")}>Dashboard</a>
                    <a href="/eventos" className={linkClass("/eventos")}>Eventos</a>
                    <a href="/relatorios" className={linkClass("/relatorios")}>Relatórios</a>
                    <a href="/logout" className={linkClass("/logout")}>Sair</a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
