import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type Modulo = { id: number; nome: string; curso_id: number };
type Curso = { id: number; nome: string; evento_id: number };

export default function AdicionarAula() {
    // ts-ignore
    const { modulo, curso }: { modulo: Modulo; curso: Curso } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        titulo: '',
        descricao: '',
        publicada: false,
    });

    const [validationErrors, setValidationErrors] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);

        post(route('aulaStore', { modulo: modulo.id }), {
            preserveScroll: true,
            onError: (errs) => setValidationErrors(errs),
        });
    };

    return (
        <>
            <Head title="Adicionar Aula" />
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
                            <h2 className="text-primary text-xl font-bold dark:text-white">Adicionar Aula</h2>
                            <p className="text-sm text-muted-foreground dark:text-white/70">
                                Módulo: <span className="font-semibold">{modulo.nome}</span> • Curso:{' '}
                                <span className="font-semibold">{curso.nome}</span>
                            </p>

                        </div>
                        <Button asChild variant="secondary">
                            <Link href={route('gerenciarCurso', { evento: curso.evento_id })}><ArrowLeft/> Voltar</Link>
                        </Button>
                    </div>

                    <Card className="dark:bg-dark rounded-2xl p-5 lg:w-full">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Título *</label>
                                <Input value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} placeholder="Ex: Aula 01" />
                                {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Descrição</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-dark dark:text-white"
                                    rows={4}
                                    value={data.descricao}
                                    onChange={(e) => setData('descricao', e.target.value)}
                                    placeholder="Opcional..."
                                />
                                {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
                            </div>
                            <div className="flex items-center justify-between rounded-xl border p-4 dark:border-white/10">
                                <div>
                                    <div className="text-primary text-sm font-semibold dark:text-white">
                                        Aula publicada?
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-white/70">
                                        Apenas aulas publicadas aparecem para os alunos.
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    className="h-5 w-5 cursor-pointer accent-indigo-500"
                                    checked={data.publicada}
                                    onChange={(e) => setData('publicada', e.target.checked)}
                                />
                            </div>


                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar Aula'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </DefaultLayout>
        </>
    );
}
