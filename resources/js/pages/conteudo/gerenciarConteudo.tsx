import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pencil, Plus, Trash, ExternalLink, FileDown, ArrowLeft, GripVertical } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Aula = { id: number; titulo: string; ordem: number };
type Modulo = { id: number; nome: string };
type Curso = { id: number; nome: string; evento_id: number };

type Conteudo = {
    id: number;
    tipo: 'video' | 'texto' | 'anexo' | 'link' | string;
    ordem: number;
    video_yt_id?: string | null;
    texto?: string | null;
    link_url?: string | null;
    arquivo_path?: string | null;
    arquivo_nome?: string | null;
    arquivo_mime?: string | null;
    arquivo_size?: number | null;
};

type PageProps = {
    flash?: { success?: string; error?: string };
    aula: Aula;
    modulo: Modulo;
    curso: Curso;
    conteudos: Conteudo[];
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

function ytUrlFromId(id?: string | null) {
    if (!id) return null;
    return `https://www.youtube.com/watch?v=${id}`;
}

function arrayMove<T>(arr: T[], from: number, to: number) {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
}

function withSequentialOrder<T extends { ordem: number }>(items: T[]) {
    return items.map((it, idx) => ({ ...it, ordem: idx + 1 }));
}

export default function GerenciarConteudos() {
    // ts-ignore
    const { flash, aula, modulo, curso, conteudos }: PageProps = usePage().props as any;

    const successMessage = flash?.success;
    const errorMessage = flash?.error;

    const sorted = useMemo(
        () => [...(conteudos ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
        [conteudos],
    );

    const { processing } = useForm({});

    // ===== Drag & Drop (igual aos outros) =====
    const [conteudosState, setConteudosState] = useState<Conteudo[]>(withSequentialOrder(sorted));
    const [dragConteudoId, setDragConteudoId] = useState<number | null>(null);

    useEffect(() => {
        setConteudosState(withSequentialOrder(sorted));
    }, [sorted]);

    function persistConteudosOrder(next: Conteudo[]) {
        const ids = next.map((c) => c.id);

        router.post(
            route('conteudosReordenar', { aula: aula.id }),
            { ids },
            { preserveScroll: true, preserveState: true },
        );
    }

    function reorderConteudosByDrop(targetConteudoId: number) {
        if (!dragConteudoId || dragConteudoId === targetConteudoId) return;

        const from = conteudosState.findIndex((c) => c.id === dragConteudoId);
        const to = conteudosState.findIndex((c) => c.id === targetConteudoId);
        if (from < 0 || to < 0) return;

        const moved = arrayMove(conteudosState, from, to);
        const next = withSequentialOrder(moved);

        setConteudosState(next);
        persistConteudosOrder(next);
    }

    // ===== Modal de exclusão =====
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toDelete, setToDelete] = useState<Conteudo | null>(null);

    const openDeleteModal = (c: Conteudo) => {
        setToDelete(c);
        setDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        if (processing) return;
        setDeleteOpen(false);
        setToDelete(null);
    };

    const confirmDelete = () => {
        if (!toDelete) return;

        router.delete(route('conteudoDestroy', { conteudo: toDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title={`Gerenciar Conteúdos - ${aula?.titulo ?? 'Aula'}`} />
            <DefaultLayout>
                {/* Flash */}
                {(successMessage || errorMessage) && (
                    <Alert variant={errorMessage ? 'error' : 'success'}>
                        <AlertTitle variant={errorMessage ? 'error' : 'success'}>
                            {errorMessage ? 'Erro' : 'Sucesso'}
                        </AlertTitle>
                        <AlertDescription>{errorMessage ?? successMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="mx-auto mt-4 w-full max-w-5xl space-y-6 px-3 pb-10">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-primary text-xl font-bold dark:text-white">Gerenciar Conteúdos</h2>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Curso: <span className="font-semibold">{curso.nome}</span> • Módulo:{' '}
                                <span className="font-semibold">{modulo.nome}</span>
                            </div>

                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Aula {aula.ordem}: <span className="font-semibold">{aula.titulo}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button asChild variant="secondary">
                                <Link href={route('gerenciarCurso', { evento: curso.evento_id })}>
                                    <ArrowLeft /> Voltar
                                </Link>
                            </Button>

                            <Button asChild className="rounded-md">
                                <Link
                                    href={route('conteudoCriar', { aula: aula.id })}
                                    className="flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Adicionar Conteúdo
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="dark:bg-dark rounded-2xl p-5 lg:w-full">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <div className="text-primary text-base font-semibold dark:text-white">Conteúdos</div>
                                <div className="text-xs text-muted-foreground dark:text-white/70">
                                    Total: {conteudosState.length}
                                </div>
                            </div>

                            {conteudosState.length > 0 ? (
                                <div className="text-xs text-muted-foreground dark:text-white/70">
                                    Arraste os cards para reordenar.
                                </div>
                            ) : null}
                        </div>

                        {conteudosState.length === 0 ? (
                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                Nenhum conteúdo ainda. Clique em{' '}
                                <span className="font-semibold">“Adicionar Conteúdo”</span>.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conteudosState.map((c) => {
                                    const isVideo = c.tipo === 'video';
                                    const isTexto = c.tipo === 'texto';
                                    const isLink = c.tipo === 'link';
                                    const isAnexo = c.tipo === 'anexo';

                                    const arquivoUrl = c.arquivo_path ? `/storage/${c.arquivo_path}` : null;
                                    const youtubeUrl = ytUrlFromId(c.video_yt_id ?? null);

                                    return (
                                        <div
                                            key={c.id}
                                            className={`flex flex-col gap-3 rounded-xl border p-4 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between ${dragConteudoId === c.id ? 'opacity-60' : ''
                                                }`}
                                            draggable
                                            onDragStart={(e) => {
                                                // evita começar drag quando clicar em botões/links
                                                const target = e.target as HTMLElement;
                                                if (target.closest('a,button')) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                setDragConteudoId(c.id);
                                            }}
                                            onDragEnd={() => setDragConteudoId(null)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                reorderConteudosByDrop(c.id);
                                            }}
                                            title="Arraste para reordenar o conteúdo"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-muted-foreground/80 dark:text-white/60">
                                                        <GripVertical size={18} />
                                                    </span>

                                                    <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                                        {c.ordem}
                                                    </span>

                                                    <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                                                        {String(c.tipo).toUpperCase()}
                                                    </span>
                                                </div>

                                                {isVideo && (
                                                    <div className="text-sm text-foreground dark:text-white">
                                                        Vídeo: <span className="font-semibold">{c.video_yt_id}</span>
                                                        {youtubeUrl ? (
                                                            <a
                                                                href={youtubeUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="ml-2 inline-flex items-center gap-1 text-xs underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                abrir <ExternalLink size={12} />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                )}

                                                {isTexto && (
                                                    <div className="text-sm text-foreground dark:text-white">
                                                        Texto:{' '}
                                                        <span className="text-muted-foreground dark:text-white/70">
                                                            {c.texto
                                                                ? `${c.texto.slice(0, 120)}${c.texto.length > 120 ? '…' : ''
                                                                }`
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                )}

                                                {isLink && (
                                                    <div className="text-sm text-foreground dark:text-white">
                                                        Link:{' '}
                                                        {c.link_url ? (
                                                            <a
                                                                href={c.link_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {c.link_url} <ExternalLink size={12} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground dark:text-white/70">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {isAnexo && (
                                                    <div className="text-sm text-foreground dark:text-white">
                                                        Anexo:{' '}
                                                        {arquivoUrl ? (
                                                            <a
                                                                href={arquivoUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FileDown size={14} />
                                                                {c.arquivo_nome ?? 'Baixar'}
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground dark:text-white/70">
                                                                —
                                                            </span>
                                                        )}

                                                        {(c.arquivo_mime || c.arquivo_size) ? (
                                                            <div className="text-xs text-muted-foreground dark:text-white/70">
                                                                {c.arquivo_mime ? c.arquivo_mime : null}
                                                                {c.arquivo_mime && c.arquivo_size ? ' • ' : null}
                                                                {c.arquivo_size ? formatBytes(c.arquivo_size) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 sm:justify-end">
                                                <Button asChild className="rounded-md" size="sm">
                                                    <Link
                                                        href={route('conteudoEditar', { conteudo: c.id })}
                                                        className="flex items-center gap-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </Link>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="flex items-center rounded-md"
                                                    disabled={processing}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(c);
                                                    }}
                                                    size="sm"
                                                >
                                                    <Trash size={14} className="mr-2" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* ===== Modal Confirm Delete ===== */}
                <Dialog
                    open={deleteOpen}
                    onOpenChange={(open) => (open ? setDeleteOpen(true) : closeDeleteModal())}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Excluir conteúdo?</DialogTitle>

                            <DialogDescription>
                                Essa ação <span className="font-semibold">não pode ser desfeita</span>.
                            </DialogDescription>

                            {toDelete ? (
                                <div className="mt-2 rounded-lg border p-3 text-sm dark:border-white/10">
                                    Você está prestes a excluir o conteúdo{' '}
                                    <span className="font-semibold">#{toDelete.ordem}</span> (
                                    <span className="font-semibold">{String(toDelete.tipo).toUpperCase()}</span>).
                                </div>
                            ) : null}
                        </DialogHeader>

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button type="button" variant="secondary" onClick={closeDeleteModal} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={processing || !toDelete}
                            >
                                {processing ? 'Excluindo...' : 'Excluir'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DefaultLayout>
        </>
    );
}