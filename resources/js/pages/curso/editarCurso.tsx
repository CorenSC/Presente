import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

type Curso = {
    id: number;
    evento_id: number;
    nome: string;
    descricao?: string | null;
    carga_horaria?: number | null;
};

export default function EditarCurso() {
    // ts-ignore
    const { curso }: { curso: Curso } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        nome: curso.nome ?? '',
        descricao: curso.descricao ?? '',
        carga_horaria: curso.carga_horaria ?? '',
    });

    const [validationErrors, setValidationErrors] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors(null);

        put(route('cursoUpdate', { curso: curso.id }), {
            preserveScroll: true,
            onError: (errs) => setValidationErrors(errs),
        });
    };

    return (
        <>
            <Head title="Editar Curso" />
            <DefaultLayout>
                <div className="mx-auto w-full max-w-3xl space-y-6 px-3 pb-10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-primary flex items-center gap-2 text-xl font-bold dark:text-white">
                                <Pencil size={18} /> Editar Curso
                            </h2>
                            <p className="text-sm text-muted-foreground dark:text-white/70">
                                Atualize as informações do curso.
                            </p>
                        </div>
                        <Button asChild variant="secondary">
                            <Link href={route('gerenciarCurso', { evento: curso.evento_id })}><ArrowLeft/> Voltar</Link>
                        </Button>
                    </div>

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

                    <Card className="dark:bg-dark rounded-2xl p-5 lg:w-full">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Nome do curso *</label>
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
                                />
                                {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Carga horária (h)</label>
                                <Input
                                    type="number"
                                    value={data.carga_horaria as any}
                                    onChange={(e) => setData('carga_horaria', e.target.value)}
                                    placeholder="Ex: 28"
                                />
                                {errors.carga_horaria && <p className="text-sm text-red-500">{errors.carga_horaria}</p>}
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
