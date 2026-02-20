import { Head, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Curso = {
    id: number;
    nome: string;
    evento_id: number;
};

export default function AdicionarModulo() {
    // ts-ignore
    const { curso }: { curso: Curso } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        tem_prova: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('moduloStore', { curso: curso.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Adicionar Módulo" />
            <DefaultLayout>
                <div className="flex flex-col items-center mx-auto w-full space-y-6 px-3 pb-10">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-primary text-xl font-bold dark:text-white">
                                Adicionar Módulo
                            </h2>
                            <p className="text-sm text-muted-foreground dark:text-white/70">
                                Curso: <span className="font-semibold">{curso.nome}</span>
                            </p>
                        </div>
                    </div>

                    <Card className="dark:bg-dark rounded-2xl p-5 w-1/2">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Nome */}
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">
                                    Nome do módulo
                                </label>
                                <Input
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Ex: Introdução"
                                />
                                {errors.nome && (
                                    <p className="text-sm text-red-500">{errors.nome}</p>
                                )}
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">
                                    Descrição
                                </label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-dark dark:text-white"
                                    rows={4}
                                    value={data.descricao}
                                    onChange={(e) => setData('descricao', e.target.value)}
                                    placeholder="Descrição opcional do módulo..."
                                />
                                {errors.descricao && (
                                    <p className="text-sm text-red-500">{errors.descricao}</p>
                                )}
                            </div>

                            {/* Datas */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">
                                        Data início
                                    </label>
                                    <Input
                                        type="date"
                                        value={data.data_inicio}
                                        onChange={(e) => setData('data_inicio', e.target.value)}
                                    />
                                    {errors.data_inicio && (
                                        <p className="text-sm text-red-500">{errors.data_inicio}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">
                                        Data fim
                                    </label>
                                    <Input
                                        type="date"
                                        value={data.data_fim}
                                        onChange={(e) => setData('data_fim', e.target.value)}
                                    />
                                    {errors.data_fim && (
                                        <p className="text-sm text-red-500">{errors.data_fim}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tem prova */}
                            <div className="flex items-center justify-between rounded-xl border p-4 dark:border-white/10">
                                <div>
                                    <div className="text-primary text-sm font-semibold dark:text-white">
                                        Este módulo possui prova?
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-white/70">
                                        Você pode configurar a prova agora ou depois.
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    className="h-5 w-5 cursor-pointer accent-indigo-500"
                                    checked={data.tem_prova}
                                    onChange={(e) => setData('tem_prova', e.target.checked)}
                                />
                            </div>

                            {/* Ações */}
                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar Módulo'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </DefaultLayout>
        </>
    );
}

