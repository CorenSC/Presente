import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';

type Eventos = {
    id: number;
    nome: string;
    descricao: string;
    data_inicio: string;
    local_do_evento: string;
    status: string;
};

interface EventosProps {
    eventos: Eventos[];
}

export default function Eventos({ eventos }: EventosProps) {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggle = (id: number) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <>
            <Head>
                <title>Meus Eventos</title>
            </Head>

            <DefaultFormCadastro>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-primary dark:text-white">
                        Meus Eventos
                    </h1>

                    {eventos.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            Você não está inscrito em nenhum evento.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {eventos.map((evento) => (
                                <div
                                    key={evento.id}
                                    className="rounded-lg shadow-sm bg-white dark:bg-gray-800 transition"
                                >
                                    <button
                                        onClick={() => toggle(evento.id)}
                                        className="w-full flex justify-between items-center px-4 py-3 text-left sm:text-base text-sm"
                                    >
                                        <div>
                                            <h2 className="font-medium text-gray-800 dark:text-white">
                                                {evento.nome}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-gray-400">
                                                {new Date(evento.data_inicio).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-2xl text-gray-400 transition-transform duration-300">
                                            {openId === evento.id ? '−' : '+'}
                                        </span>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            openId === evento.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-4 pb-4 text-sm sm:text-base text-gray-600 dark:text-gray-200">
                                            <p className="mb-2">
                                                <strong>Descrição:</strong> {evento.descricao}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Local:</strong> {evento.local_do_evento}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Status:</strong>{' '}
                                                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                                                    {evento.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DefaultFormCadastro>
        </>
    );
}
