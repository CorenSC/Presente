import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Certificado = {
    arquivo: string;
};

type Eventos = {
    id: number;
    nome: string;
    descricao: string;
    data_inicio: string;
    local_do_evento: string;
    status: string;
    certificado?: Certificado | null;
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
                <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-primary mb-6 text-center text-2xl font-bold sm:text-3xl dark:text-white">Meus Eventos</h1>

                    {eventos.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">Você não está inscrito em nenhum evento.</p>
                    ) : (
                        <div className="space-y-3">
                            {eventos.map((evento) => (
                                <div key={evento.id} className="rounded-lg bg-white shadow-sm transition dark:bg-gray-800">
                                    <button
                                        onClick={() => toggle(evento.id)}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm sm:text-base"
                                    >
                                        <div>
                                            <h2 className="font-medium text-gray-800 dark:text-white">{evento.nome}</h2>
                                            <p className="text-xs text-gray-400 sm:text-sm">{new Date(evento.data_inicio).toLocaleDateString()}</p>
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
                                        <div className="px-4 pb-4 text-sm text-gray-600 sm:text-base dark:text-gray-200">
                                            <p className="mb-2">
                                                <strong>Descrição:</strong> {evento.descricao}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Local:</strong> {evento.local_do_evento}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Status:</strong>{' '}
                                                <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                    {evento.status}
                                                </span>
                                            </p>

                                            {evento.certificado && (
                                                <>
                                                    <a
                                                        href={`/storage/${evento.certificado.arquivo}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-block rounded bg-primary px-4 py-2 text-sm text-white active:scale-95 cursor-pointer sm:text-base"
                                                    >
                                                        Ver Certificado
                                                    </a>
                                                </>

                                            )}
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
