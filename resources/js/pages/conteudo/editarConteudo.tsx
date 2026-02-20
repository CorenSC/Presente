import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FileDown, Save } from 'lucide-react';

type Aula = { id: number; titulo: string; ordem: number };
type Modulo = { id: number; nome: string };
type Curso = { id: number; nome: string; evento_id: number };

type Conteudo = {
    id: number;
    aula_id: number;
    tipo: 'video' | 'texto' | 'anexo' | 'link';
    video_yt_id?: string | null;
    texto?: string | null;
    link_url?: string | null;
    arquivo_path?: string | null;
    arquivo_nome?: string | null;
    arquivo_mime?: string | null;
    arquivo_size?: number | null;
    ordem: number;
};

type PageProps = {
    flash?: { success?: string; error?: string };
    conteudo: Conteudo;
    aula: Aula;
    modulo: Modulo;
    curso: Curso;
};

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

export default function EditarConteudo() {
    // ts-ignore
    const { flash, conteudo, aula, modulo, curso }: PageProps = usePage().props as any;

    const successMessage = flash?.success;
    const errorMessage = flash?.error;

    const arquivoUrl = useMemo(() => {
        return conteudo?.arquivo_path ? `/storage/${conteudo.arquivo_path}` : null;
    }, [conteudo?.arquivo_path]);

    const { data, setData, put, processing, errors } = useForm<{
        tipo: 'video' | 'texto' | 'anexo' | 'link';
        video_yt_id: string;
        texto: string;
        link_url: string;
        arquivo: File | null;
    }>({
        tipo: conteudo.tipo,
        video_yt_id: conteudo.video_yt_id ?? '',
        texto: conteudo.texto ?? '',
        link_url: conteudo.link_url ?? '',
        arquivo: null,
    });

    const [validationErrors, setValidationErrors] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);

        put(route('conteudoUpdate', { conteudo: conteudo.id }), {
            preserveScroll: true,
            forceFormData: true,
            onError: (errs) => setValidationErrors(errs),
        });
    };

    const showVideo = data.tipo === 'video';
    const showTexto = data.tipo === 'texto';
    const showLink = data.tipo === 'link';
    const showAnexo = data.tipo === 'anexo';

    return (
        <>
            <Head title="Editar Conteúdo" />
            <DefaultLayout>
                <div className="mx-auto w-full max-w-4xl space-y-6 px-3 pb-10">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-primary text-xl font-bold dark:text-white">Editar Conteúdo</h2>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Curso: <span className="font-semibold">{curso.nome}</span> • Módulo:{' '}
                                <span className="font-semibold">{modulo.nome}</span>
                            </div>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Aula {aula.ordem}: <span className="font-semibold">{aula.titulo}</span>
                            </div>

                            <div className="text-xs text-muted-foreground dark:text-white/70">
                                Conteúdo #{conteudo.ordem}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button asChild variant="secondary" className="rounded-md">
                                <Link href={route('conteudosGerenciar', { aula: aula.id })} className="flex items-center gap-2">
                                    <ArrowLeft size={16} />
                                    Voltar
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Flash */}
                    {(successMessage || errorMessage) && (
                        <Alert variant={errorMessage ? 'destructive' : 'default'}>
                            <AlertTitle>{errorMessage ? 'Erro' : 'Sucesso'}</AlertTitle>
                            <AlertDescription>{errorMessage ?? successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Erros gerais */}
                    {validationErrors && (
                        <Alert variant="destructive">
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
                            {/* Tipo */}
                            <div className="space-y-2">
                                <label className="text-primary text-sm font-semibold dark:text-white">Tipo *</label>
                                <Select
                                    value={data.tipo}
                                    onValueChange={(v) => {
                                        const tipo = v as any;
                                        setData('tipo', tipo);

                                        // limpa campos ao trocar
                                        setData('video_yt_id', '');
                                        setData('texto', '');
                                        setData('link_url', '');
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

                            {/* Vídeo */}
                            {showVideo && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">ID do vídeo do YouTube *</label>
                                    <Input
                                        value={data.video_yt_id}
                                        onChange={(e) => setData('video_yt_id', e.target.value)}
                                        placeholder="Ex: dQw4w9WgXcQ"
                                    />
                                    {errors.video_yt_id && <p className="text-sm text-red-500">{errors.video_yt_id}</p>}
                                </div>
                            )}

                            {/* Texto */}
                            {showTexto && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Texto *</label>
                                    <textarea
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-dark dark:text-white"
                                        rows={8}
                                        value={data.texto}
                                        onChange={(e) => setData('texto', e.target.value)}
                                    />
                                    {errors.texto && <p className="text-sm text-red-500">{errors.texto}</p>}
                                </div>
                            )}

                            {/* Link */}
                            {showLink && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">URL *</label>
                                    <Input
                                        value={data.link_url}
                                        onChange={(e) => setData('link_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {errors.link_url && <p className="text-sm text-red-500">{errors.link_url}</p>}
                                </div>
                            )}

                            {/* Anexo */}
                            {showAnexo && (
                                <div className="space-y-2">
                                    <label className="text-primary text-sm font-semibold dark:text-white">Arquivo</label>

                                    {/* arquivo atual */}
                                    {arquivoUrl ? (
                                        <div className="rounded-lg border p-3 text-sm dark:border-white/10">
                                            <div className="text-muted-foreground dark:text-white/70">Arquivo atual:</div>
                                            <a
                                                href={arquivoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-flex items-center gap-2 underline"
                                            >
                                                <FileDown size={14} />
                                                {conteudo.arquivo_nome ?? 'Baixar'}
                                            </a>
                                            {(conteudo.arquivo_mime || conteudo.arquivo_size) ? (
                                                <div className="mt-1 text-xs text-muted-foreground dark:text-white/70">
                                                    {conteudo.arquivo_mime ?? ''}
                                                    {conteudo.arquivo_mime && conteudo.arquivo_size ? ' • ' : ''}
                                                    {conteudo.arquivo_size ? formatBytes(conteudo.arquivo_size) : ''}
                                                </div>
                                            ) : null}
                                            <div className="mt-2 text-xs text-muted-foreground dark:text-white/70">
                                                Se você escolher um novo arquivo, ele vai substituir o atual.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground dark:text-white/70">
                                            Nenhum arquivo anexado ainda. Selecione um arquivo para salvar.
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-accent dark:file:bg-dark dark:file:text-white"
                                        onChange={(e) => setData('arquivo', e.target.files?.[0] ?? null)}
                                    />

                                    {errors.arquivo && <p className="text-sm text-red-500">{errors.arquivo}</p>}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing} className="rounded-md">
                                    <Save size={16} className="mr-2" />
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
