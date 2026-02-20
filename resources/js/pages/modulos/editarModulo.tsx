import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';


type Curso = {
    id: number;
    nome: string;
    evento_id: number;
};

type Modulo = {
    id: number;
    curso_id: number;
    nome: string;
    descricao?: string | null;
    data_inicio?: string | null; // Y-m-d
    data_fim?: string | null;    // Y-m-d
    tem_prova: boolean;
    ordem: number;
};

export default function EditarModulo() {
    // ts-ignore
    const { modulo, curso }: { modulo: Modulo; curso: Curso } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        nome: modulo.nome ?? '',
        descricao: modulo.descricao ?? '',
        data_inicio: modulo.data_inicio ?? '',
        data_fim: modulo.data_fim ?? '',
        tem_prova: !!modulo.tem_prova,
    });

    const [validationErrors, setValidationErrors] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);

        put(route('moduloUpdate', { modulo: modulo.id }), { preserveScroll: true });
    };


    return (
        <>
            <Head title="Editar Módulo" />
            <DefaultLayout>
                {validationErrors && (
                    <Alert>
                        <AlertTitle>Erros</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4">
                                {Object.values(validationErrors).map((error: any, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="mx-auto w-full max-w-3xl space-y-6 px-3 pb-10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-primary text-xl font-bold dark:text-white flex items-center gap-2">
                                <Pencil size={18} /> Editar Módulo
                            </h2>
                            <p className="text-sm text-muted-foreground dark:text-white/70">
                                Curso: <span className="font-semibold">{curso.nome}</span>
                            </p>
                        </div>
                    </div>

                    <Card className="dark:bg-dark rounded-2xl p-5 lg:w-full">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Nome do módulo *</label>
                                <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Descrição</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-dark dark:text-white"
                                    rows={4}
                                    value={data.descricao}
                                    onChange={(e) => setData('descricao', e.target.value)}
                                    placeholder="Descrição opcional do módulo..."
                                />
                                {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Data início</label>
                                    <Input type="date" value={data.data_inicio} onChange={(e) => setData('data_inicio', e.target.value)} />
                                    {errors.data_inicio && <p className="text-sm text-red-500">{errors.data_inicio}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Data fim</label>
                                    <Input type="date" value={data.data_fim} onChange={(e) => setData('data_fim', e.target.value)} />
                                    {errors.data_fim && <p className="text-sm text-red-500">{errors.data_fim}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border p-4 dark:border-white/10">
                                <div>
                                    <div className="text-primary text-sm font-semibold dark:text-white">Este módulo possui prova?</div>
                                    <div className="text-xs text-muted-foreground dark:text-white/70">Você pode configurar a prova agora ou depois.</div>
                                </div>

                                <input
                                    type="checkbox"
                                    className="h-5 w-5 cursor-pointer accent-indigo-500"
                                    checked={data.tem_prova}
                                    onChange={(e) => setData('tem_prova', e.target.checked)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar alterações'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </DefaultLayout>
        </>
    );
}
