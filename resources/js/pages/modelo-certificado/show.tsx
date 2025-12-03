import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { BiSolidEdit } from 'react-icons/bi';

interface Modelo {
    id: number;
    nome: string;
    conteudo: string;
    imagem_fundo: string;
}

export default function Show() {
    // @ts-ignore
    const { flash, modelo }: { flash: Record<string, any>; modelo: Modelo } = usePage().props;
    const successMessage = flash?.success;
    const alertType = (['success', 'error', 'warning', 'info'].find((type) => type in (flash || {})) || 'success') as
        | 'success'
        | 'error'
        | 'warning'
        | 'info';

    const editarModelo = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('modeloCertificadoEditar', modelo.id), {});
    };
    return (
        <>
            <Head title={`Visualizar modelo ID: ${modelo?.id}`} />
            <DefaultLayout>
                {successMessage && (
                    // @ts-ignore
                    <Alert className="justify-self-center" variant={alertType}>
                        <AlertTitle variant={alertType}>Sucesso</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}
                <div className="text-primary mx-auto mt-12 max-w-4xl space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-none dark:bg-gray-800 dark:text-white">
                    <div className="space-y-2 text-center">
                        <h1 className="text-4xl font-bold tracking-tight">Modelo certificado: {modelo.nome}</h1>
                        <p className="text-sm">ID: {modelo.id}</p>

                        <div className="relative mx-auto mt-12 aspect-[4/3] w-full max-w-4xl shadow-xl">
                            {/* Imagem de fundo */}
                            <img
                                src={`/storage/${modelo.imagem_fundo}`}
                                alt="Imagem de fundo do certificado"
                                className="absolute top-0 left-0 z-0 h-full w-full rounded-2xl object-cover"
                            />

                            {/* Conteúdo sobre a imagem centralizado */}
                            <div
                                className="text-primary absolute inset-0 z-10 flex items-center justify-center p-12 text-center"
                                dangerouslySetInnerHTML={{ __html: modelo.conteudo }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={editarModelo}
                        className="flex cursor-pointer items-center justify-around gap-3 rounded-xl bg-yellow-600/80 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-yellow-700 active:scale-95"
                    >
                        <BiSolidEdit className="text-xl" />
                        <span className="text-sm font-medium">Editar</span>
                    </button>
                </div>
            </DefaultLayout>
        </>
    );
}
