import React, { useMemo, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Pencil, GripVertical } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Aula {
    id: number;
    ordem: number;
    titulo: string;
}

interface Modulo {
    id: number;
    nome: string;
    descricao?: string | null;
    ordem: number;
    tem_prova: boolean;

    aulas_count?: number;
    aula?: Aula[];

    prova?: { id: number } | null;
}

interface Curso {
    id: number;
    nome: string;
    descricao?: string | null;
    carga_horaria: number;
    evento_id: number;

    modulos?: Modulo[];

    total_aulas?: number;
    total_provas?: number;
}

type DragAula = { aulaId: number; moduloId: number } | null;

function arrayMove<T>(arr: T[], from: number, to: number) {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
}

function withSequentialOrder<T extends { ordem: number }>(items: T[]) {
    return items.map((it, idx) => ({ ...it, ordem: idx + 1 }));
}

export default function GerenciarCurso() {
    // ts-ignore
    const { flash, curso }: { flash: Record<string, any>; curso: Curso } = usePage().props;

    const successMessage = flash?.success;

    // Estado local (pra reorder instantâneo na UI)
    const [modulosState, setModulosState] = useState<Modulo[]>(
        withSequentialOrder(
            (curso?.modulos ?? [])
                .slice()
                .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                .map((m) => ({
                    ...m,
                    aula: (m.aula ?? []).slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
                })),
        ),
    );

    const [dragModuloId, setDragModuloId] = useState<number | null>(null);
    const [dragAula, setDragAula] = useState<DragAula>(null);

    const totalModulos = modulosState.length;

    const totalAulas =
        typeof curso?.total_aulas === 'number'
            ? curso.total_aulas
            : modulosState.reduce((acc, m) => acc + (m.aulas_count ?? (m.aula?.length ?? 0)), 0);

    const totalProvas =
        typeof curso?.total_provas === 'number'
            ? curso.total_provas
            : modulosState.reduce((acc, m) => acc + (m.tem_prova ? 1 : 0), 0);

    function persistModulosOrder(nextModulos: Modulo[]) {
        const ids = nextModulos.map((m) => m.id);

        router.post(
            route('modulosReordenar', { curso: curso.id }),
            { ids },
            { preserveScroll: true, preserveState: true },
        );
    }

    function persistAulasOrder(moduloId: number, nextAulas: Aula[]) {
        const ids = nextAulas.map((a) => a.id);

        router.post(
            route('aulasReordenar', { modulo: moduloId }),
            { ids },
            { preserveScroll: true, preserveState: true },
        );
    }

    function reorderModulosByDrop(targetModuloId: number) {
        if (!dragModuloId || dragModuloId === targetModuloId) return;

        const from = modulosState.findIndex((m) => m.id === dragModuloId);
        const to = modulosState.findIndex((m) => m.id === targetModuloId);
        if (from < 0 || to < 0) return;

        const moved = arrayMove(modulosState, from, to);
        const next = withSequentialOrder(moved);

        setModulosState(next);
        persistModulosOrder(next);
    }

    function reorderAulasByDrop(moduloId: number, targetAulaId: number) {
        if (!dragAula) return;
        if (dragAula.moduloId !== moduloId) return; // só reorder dentro do mesmo módulo
        if (dragAula.aulaId === targetAulaId) return;

        const moduloIdx = modulosState.findIndex((m) => m.id === moduloId);
        if (moduloIdx < 0) return;

        const aulas = (modulosState[moduloIdx].aula ?? []).slice();
        const from = aulas.findIndex((a) => a.id === dragAula.aulaId);
        const to = aulas.findIndex((a) => a.id === targetAulaId);
        if (from < 0 || to < 0) return;

        const moved = arrayMove(aulas, from, to);
        const nextAulas = withSequentialOrder(moved);

        const nextModulos = [...modulosState];
        nextModulos[moduloIdx] = { ...nextModulos[moduloIdx], aula: nextAulas };

        setModulosState(nextModulos);
        persistAulasOrder(moduloId, nextAulas);
    }

    return (
        <>
            <Head title={`Gerenciar Curso - ${curso?.nome ?? 'Curso'}`} />
            <DefaultLayout>
                {successMessage && (
                    <Alert className="justify-self-center" variant="success">
                        <AlertTitle variant="success">Sucesso</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="mx-auto mt-4 w-full max-w-5xl space-y-6 px-3 pb-10">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-primary text-xl font-bold dark:text-white">Gerenciar Curso</h2>
                            <p className="text-muted-foreground text-sm dark:text-white/70">
                                Organize módulos, aulas e provas do curso.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button asChild variant="secondary" className="rounded-md">
                                <Link href={route('cursoEditar', { curso: curso.id })} className="flex items-center gap-2">
                                    <Pencil size={16} />
                                    Editar Curso
                                </Link>
                            </Button>

                            <Button asChild className="rounded-md">
                                <Link className="flex items-center gap-2" href={route('criarModulo', { curso: curso.id })}>
                                    + Adicionar Módulo
                                </Link>
                            </Button>

                            <Button asChild variant="outline" className="rounded-md">
                                <Link href={route('cursoPlayer', { evento: curso.evento_id })} className="flex items-center gap-2">
                                    Ver Preview
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Resumo do curso */}
                    <Card className="dark:bg-dark flex flex-col gap-4 rounded-2xl px-5 py-4 lg:w-full">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="text-primary text-lg font-semibold dark:text-white">{curso?.nome ?? '—'}</div>
                                <div className="text-primary text-sm dark:text-white/90">
                                    <span className="font-semibold">Descrição:</span> {curso?.descricao ? curso.descricao : '—'}
                                </div>
                                <div className="text-primary text-sm dark:text-white/90">
                                    <span className="font-semibold">Carga horária:</span> {curso?.carga_horaria ?? 0}(h)
                                </div>
                            </div>

                            {/* Indicadores */}
                            <div className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {totalModulos} módulos
                                </span>
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {totalAulas} aulas
                                </span>
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {totalProvas} provas
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Lista de módulos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-primary text-base font-semibold dark:text-white">Módulos</h3>
                        </div>

                        {modulosState.length === 0 ? (
                            <Card className="dark:bg-dark rounded-2xl p-6 lg:w-full">
                                <div className="text-primary dark:text-white">
                                    Ainda não há módulos. Clique em <span className="font-semibold">“Adicionar Módulo”</span> para começar.
                                </div>
                            </Card>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-3">
                                {modulosState.map((m) => {
                                    const aulasCount = m.aulas_count ?? m.aula?.length ?? 0;
                                    const provaStatus = m.tem_prova ? (m.prova?.id ? 'Prova criada' : 'Prova pendente') : 'Sem prova';

                                    return (
                                        <AccordionItem
                                            key={m.id}
                                            value={`mod-${m.id}`}
                                            className={`acc-item dark:bg-dark bg-card overflow-hidden rounded-2xl border shadow-sm ${dragModuloId === m.id ? 'opacity-60' : ''
                                                }`}
                                            draggable
                                            onDragStart={(e) => {
                                            if (dragAula) {
                                                e.preventDefault();
                                                return;
                                            }
                                            setDragModuloId(m.id);
                                            }}
                                            onDragEnd={() => setDragModuloId(null)}
                                            onDragOver={(e) => {
                                                if (dragAula) return;
                                                e.preventDefault();
                                            }}
                                            onDrop={(e) => {
                                                if (dragAula) return;
                                                e.preventDefault();
                                                reorderModulosByDrop(m.id);
                                            }}
                                            title="Arraste para reordenar o módulo"
                                        >
                                            <AccordionTrigger className="px-4 py-4 hover:no-underline">
                                                <div className="flex w-full items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground/80 dark:text-white/60">
                                                            <GripVertical size={18} />
                                                        </span>

                                                        <span className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold dark:bg-white/10 dark:text-white">
                                                            {m.ordem}
                                                        </span>

                                                        <div className="text-left">
                                                            <div className="text-primary font-semibold dark:text-white">{m.nome}</div>
                                                            <div className="text-muted-foreground text-xs dark:text-white/70">
                                                                {aulasCount} aulas • {provaStatus}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Ações no topo direito */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            asChild
                                                            className="h-8 rounded-md px-3"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Link href={route('moduloEditar', { modulo: m.id })} className="flex items-center gap-2">
                                                                <Pencil size={14} />
                                                                Editar
                                                            </Link>
                                                        </Button>

                                                        {m.tem_prova ? (
                                                            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                                                                Prova
                                                            </span>
                                                        ) : (
                                                            <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                                                Sem prova
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="acc-content px-4 pb-4">
                                                {/* Somente Aulas */}
                                                <div className="rounded-xl border p-4 dark:border-white/10">
                                                    <div className="text-primary text-sm font-semibold dark:text-white">Aulas</div>
                                                    <div className="text-muted-foreground mt-2 text-xs dark:text-white/70">
                                                        Arraste as aulas para reordenar (dentro do módulo).
                                                    </div>

                                                    <div className="mt-3">
                                                        <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                                                            <Link href={route('aulaCriar', { modulo: m.id })}>+ Adicionar Aula</Link>
                                                        </Button>
                                                    </div>

                                                    {(m.aula?.length ?? 0) > 0 ? (
                                                        <div className="mt-4 space-y-2">
                                                            {m.aula!.map((a) => (
                                                                <div
                                                                    key={a.id}
                                                                    className={`bg-muted flex items-center justify-between rounded-lg px-3 py-2 text-xs dark:bg-white/10 ${dragAula?.aulaId === a.id ? 'opacity-60' : ''
                                                                        }`}
                                                                    draggable
                                                                    onDragStart={(e) => { e.stopPropagation(); setDragAula({ aulaId: a.id, moduloId: m.id }); setDragModuloId(null); }}
                                                                    onDragEnd={(e) => { e.stopPropagation(); setDragAula(null); }}
                                                                    onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                                                    onDrop={(e) => { e.stopPropagation(); e.preventDefault(); reorderAulasByDrop(m.id, a.id); }}
                                                                    title="Arraste para reordenar a aula"
                                                                >
                                                                    <span className="text-foreground dark:text-white flex items-center gap-2">
                                                                        <span className="text-muted-foreground/80 dark:text-white/60">
                                                                            <GripVertical size={16} />
                                                                        </span>
                                                                        {a.ordem}. {a.titulo}
                                                                    </span>

                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 w-auto px-3"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            asChild
                                                                        >
                                                                            <Link href={route('conteudosGerenciar', { aula: a.id })}>Conteúdos</Link>
                                                                        </Button>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 w-auto px-3"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            asChild
                                                                        >
                                                                            <Link href={route('aulaEditar', { aula: a.id })} className="flex items-center gap-2">
                                                                                <Pencil size={14} />
                                                                                Editar
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                    </div>
                </div>
            </DefaultLayout>
        </>
    );
}
