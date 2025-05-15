import { Head } from '@inertiajs/react';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { formatarDataBrasileira } from '@/lib/utils';

interface Evento {
    nome: string;
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
                        🎉 A sua presença foi confirmada!
                    </h1>
                    {participante.eventos?.map((evento, index) => (
                        <p className="mt-4 text-center text-base lg:text-lg">
                            Parabéns <span className="font-semibold">{participante.nome}</span>, sua presença para o evento <span className='font-semibold'>{evento.nome}</span> foi realizada!
                        </p>
                    ))}
                </div>
            </DefaultFormCadastro>
        </>
    );
}
