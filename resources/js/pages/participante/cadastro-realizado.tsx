import { Head } from '@inertiajs/react';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { formatarDataBrasileira } from '@/lib/utils';

interface Evento {
    nome: string;
    local_do_evento: string;
    data_inicio: string;
}

interface Participante {
    nome: string;
    eventos: Evento[];
}

interface ParticipanteProps {
    participante: Participante;
}

export default function CadastroRealizado({ participante }: ParticipanteProps) {
    return (
        <>
            <Head title="Cadastro realizado" />
            <DefaultFormCadastro className="flex justify-center">
                <div className="text-primary w-full p-4 lg:w-1/2 rounded-lg h-1/2 bg-white lg:p-8 shadow-lg dark:bg-gray-800 dark:text-white">
                    <h1 className="text-xl font-bold text-center text-green-600 dark:text-green-400">
                        🎉 Cadastro realizado com sucesso!
                    </h1>
                    <p className="mt-4 text-center text-base lg:text-lg">
                        Parabéns <span className="font-semibold">{participante.nome}</span>, seu cadastro foi confirmado para o evento abaixo:
                    </p>

                    <div className="mt-6 space-y-4">
                        {participante.eventos?.map((evento, index) => (
                            <div
                                key={index}
                                className="rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                    {evento.nome}
                                </h2>
                                <p className="mt-1">
                                    <span className="font-medium">Local:</span> {evento.local_do_evento}
                                </p>
                                <p>
                                    <span className="font-medium">Data:</span> {formatarDataBrasileira(evento.data_inicio)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </DefaultFormCadastro>
        </>
    );
}
