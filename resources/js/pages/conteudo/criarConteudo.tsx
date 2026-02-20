// resources/js/pages/conteudos/criar-conteudo.tsx
import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

type Aula = { id: number; titulo: string; ordem: number };
type Modulo = { id: number; nome: string };
type Curso = { id: number; nome: string; evento_id: number };

type PageProps = {
    flash?: { success?: string; error?: string };
    aula: Aula;
    modulo: Modulo;
    curso: Curso;
};

type LinkItem = { url: string };

function formatBytes(bytes?: number | null) {
    if (!bytes || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n = n / 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function CriarConteudo() {
    // ts-ignore
    const { flash, aula, modulo, curso }: PageProps = usePage().props as any;

    const successMessage = flash?.success;
    const errorMessage = flash?.error;

    const { data, setData, post, processing, errors, reset } = useForm<{
        tipo: 'video' | 'texto' | 'anexo' | 'link';
        video_yt_id: string;
        texto: string;
        links: LinkItem[];
        arquivo: File | null;
    }>({
        tipo: 'video',
        video_yt_id: '',
        texto: '',
        links: [{ url: '' }],
        arquivo: null,
    });

    const [validationErrors, setValidationErrors] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);

        // garante limpeza consistente conforme tipo
        const payload = {
            ...data,
            video_yt_id: data.tipo === 'video' ? data.video_yt_id : '',
            texto: data.tipo === 'texto' ? data.texto : '',
            links: data.tipo === 'link' ? data.links : [{ url: '' }],
            arquivo: data.tipo === 'anexo' ? data.arquivo : null,
        };

        post(route('conteudoStore', { aula: aula.id }), {
            preserveScroll: true,
            forceFormData: true,
            data: payload as any,
            onError: (errs) => setValidationErrors(errs),
            onSuccess: () => {
                reset('video_yt_id', 'texto', 'links', 'arquivo');
                setData('video_yt_id', '');
                setData('texto', '');
                setData('links', [{ url: '' }]);
                setData('arquivo', null);
            },
        });
    };

    const showVideo = data.tipo === 'video';
    const showTexto = data.tipo === 'texto';
    const showLink = data.tipo === 'link';
    const showAnexo = data.tipo === 'anexo';

    const linkFieldErrors = Object.entries(errors).filter(([k]) => k.startsWith('links.'));
    const normalizeLinks = (links: LinkItem[]) => (links.length ? links : [{ url: '' }]);

    return (
        <>
            <Head title="Adicionar Conteúdo" />
            <DefaultLayout>
                {(successMessage || errorMessage) && (
                    <Alert variant={errorMessage ? 'error' : 'success'}>
                        <AlertTitle>{errorMessage ? 'Erro' : 'Sucesso'}</AlertTitle>
                        <AlertDescription>{errorMessage ?? successMessage}</AlertDescription>
                    </Alert>
                )}

                {validationErrors && (
                    <Alert variant="error">
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

                <div className="mx-auto w-full max-w-4xl space-y-6 px-3 pb-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-primary text-xl font-bold dark:text-white">Adicionar Conteúdo</h2>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Curso: <span className="font-semibold">{curso.nome}</span> • Módulo:{' '}
                                <span className="font-semibold">{modulo.nome}</span>
                            </div>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Aula {aula.ordem}: <span className="font-semibold">{aula.titulo}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button asChild className="rounded-md">
                                <Link
                                    href={route('conteudosGerenciar', { aula: aula.id })}
                                    className="flex items-center gap-2"
                                >
                                    Gerenciar Conteúdos
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="dark:bg-dark rounded-2xl p-5 lg:w-full">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Tipo *</label>

                                <Select
                                    value={data.tipo}
                                    onValueChange={(v) => {
                                        const tipo = v as any;
                                        setData('tipo', tipo);
                                        setData('video_yt_id', '');
                                        setData('texto', '');
                                        setData('links', [{ url: '' }]);
                                        setData('arquivo', null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Vídeo (YouTube)</SelectItem>
                                        <SelectItem value="texto">Texto</SelectItem>
                                        <SelectItem value="link">Link</SelectItem>
                                        <SelectItem value="anexo">Anexo</SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
                            </div>

                            {showVideo && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">
                                        ID do vídeo do YouTube *
                                    </label>
                                    <Input
                                        value={data.video_yt_id}
                                        onChange={(e) => setData('video_yt_id', e.target.value)}
                                        placeholder="Ex: dQw4w9WgXcQ"
                                    />
                                    {errors.video_yt_id && <p className="text-sm text-red-500">{errors.video_yt_id}</p>}
                                    <p className="text-xs text-muted-foreground dark:text-white/70">
                                        Dica: é o trecho depois de <span className="font-semibold">v=</span> na URL.
                                    </p>
                                </div>
                            )}

                            {showTexto && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Texto *</label>
                                    <textarea
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-dark dark:text-white"
                                        rows={8}
                                        value={data.texto}
                                        onChange={(e) => setData('texto', e.target.value)}
                                        placeholder="Digite o conteúdo..."
                                    />
                                    {errors.texto && <p className="text-sm text-red-500">{errors.texto}</p>}
                                </div>
                            )}

                            {showLink && (
                                <div className="space-y-2 w-full">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Links *</label>

                                    <div className="space-y-3 w-full">
                                        {data.links.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 w-full">
                                                <Input
                                                    value={item.url}
                                                    onChange={(e) => {
                                                        const next = [...data.links];
                                                        next[idx] = { url: e.target.value };
                                                        setData('links', next);
                                                    }}
                                                    placeholder="https://..."
                                                    classNameForLabel='w-full'
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const next = data.links.filter((_, i) => i !== idx);
                                                        setData('links', normalizeLinks(next));
                                                    }}
                                                    disabled={data.links.length === 1}
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setData('links', [...data.links, { url: '' }])}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Adicionar outro link
                                        </Button>
                                    </div>

                                    {/* erro geral do array */}
                                    {errors.links && <p className="text-sm text-red-500">{String(errors.links)}</p>}

                                    {/* erros por item */}
                                    {linkFieldErrors.map(([k, v]) => (
                                        <p key={k} className="text-sm text-red-500">
                                            {String(v)}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {showAnexo && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Arquivo *</label>

                                    <input
                                        type="file"
                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-accent dark:file:bg-dark dark:file:text-white"
                                        onChange={(e) => setData('arquivo', e.target.files?.[0] ?? null)}
                                    />

                                    {data.arquivo ? (
                                        <div className="text-xs text-muted-foreground dark:text-white/70">
                                            Selecionado: <span className="font-semibold">{data.arquivo.name}</span>{' '}
                                            {data.arquivo.size ? `(${formatBytes(data.arquivo.size)})` : null}
                                        </div>
                                    ) : null}

                                    {errors.arquivo && <p className="text-sm text-red-500">{errors.arquivo}</p>}
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : data.tipo === 'link' ? 'Adicionar Links' : 'Adicionar Conteúdo'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <div className="flex justify-end">
                        <Button asChild variant="outline" className="rounded-md">
                            <Link href={route('conteudosGerenciar', { aula: aula.id })}>
                                Ver todos os conteúdos desta aula
                            </Link>
                        </Button>
                    </div>
                </div>
            </DefaultLayout>
        </>
    );
}
