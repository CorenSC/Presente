import React, { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DefaultLayout from "@/layouts/app/default-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Lock,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import YoutubeCustomPlayer from "@/components/ui/youtubeCustomPlayer";

type Conteudo = {
    id: number;
    tipo: "video" | "texto" | "link" | "anexo" | string;
    ordem: number;
    video_yt_id?: string | null;
    texto?: string | null;
    link_url?: string | null;
    arquivo_path?: string | null;
    arquivo_nome?: string | null;
    arquivo_mime?: string | null;
    arquivo_size?: number | null;
};

type Aula = { id: number; titulo: string; ordem: number; conteudos: Conteudo[] };
type Modulo = { id: number; nome: string; ordem: number; aulas: Aula[] };

type PageProps = {
    evento: { id: number; nome?: string | null };
    curso: { id: number; nome: string; descricao?: string | null };
    aulaAtualId: number | null;
    concluidasIds: number[];
    modulos: Modulo[];
    unlockedIndex: number;
};

function formatBytes(bytes?: number | null) {
    if (!bytes || bytes <= 0) return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    const fixed = i === 0 ? 0 : n < 10 ? 1 : 0;
    return `${n.toFixed(fixed)} ${units[i]}`;
}

export default function PlayerCurso() {
    // ts-ignore
    const { evento, curso, aulaAtualId, concluidasIds, modulos, unlockedIndex }: PageProps =
        usePage().props as any;

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const concluidasSet = useMemo(() => new Set(concluidasIds ?? []), [concluidasIds]);

    const aulasFlat = useMemo(() => {
        const list: Aula[] = [];
        (modulos ?? []).forEach((m) => (m.aulas ?? []).forEach((a) => list.push(a)));
        return list;
    }, [modulos]);

    const idxAtual = useMemo(
        () => aulasFlat.findIndex((a) => a.id === aulaAtualId),
        [aulasFlat, aulaAtualId]
    );
    const aulaAtual = idxAtual >= 0 ? aulasFlat[idxAtual] : null;

    const prevId = idxAtual > 0 ? aulasFlat[idxAtual - 1].id : null;

    const nextUnlockedId = useMemo(() => {
        if (idxAtual < 0) return null;
        const nextIndex = idxAtual + 1;
        if (nextIndex > unlockedIndex) return null;
        return nextIndex < aulasFlat.length ? aulasFlat[nextIndex].id : null;
    }, [idxAtual, aulasFlat, unlockedIndex]);

    const goToAula = (id: number) => {
        router.get(
            route("cursoPlayer", { evento: evento.id }),
            { aula: id },
            { preserveScroll: true, preserveState: true }
        );
    };

    const concluirAula = () => {
        if (!aulaAtual) return;
        router.post(route("aulaConcluir", { aula: aulaAtual.id }), {}, { preserveScroll: true });
    };

    const concluirEAvancar = () => {
        if (!aulaAtual) return;
        router.post(route("aulaConcluir", { aula: aulaAtual.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (nextUnlockedId) goToAula(nextUnlockedId);
            },
        });
    };

    const conteudosOrdenados = useMemo(() => {
        return (aulaAtual?.conteudos ?? []).slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    }, [aulaAtual]);

    const grupos = useMemo(() => {
        const all = conteudosOrdenados;
        return {
            videos: all.filter((c) => c.tipo === "video" && c.video_yt_id),
            textos: all.filter((c) => c.tipo === "texto" && (c.texto ?? "").trim().length > 0),
            links: all.filter((c) => c.tipo === "link" && (c.link_url ?? "").trim().length > 0),
            anexos: all.filter((c) => c.tipo === "anexo" && !!c.arquivo_path),
        };
    }, [conteudosOrdenados]);

    const defaultOpenModuleId = useMemo(() => {
        if (!aulaAtualId) return null;
        for (const m of modulos ?? []) {
            if ((m.aulas ?? []).some((a) => a.id === aulaAtualId)) return m.id;
        }
        return null;
    }, [modulos, aulaAtualId]);

    return (
        <>
            <Head title={`${curso?.nome ?? "Curso"}`} />
            <DefaultLayout className="p-0">
                <div className="flex w-full">
                    {/* SIDEBAR (Rail clean quando fechado) */}
                    <aside
                        className={[
                            "relative shrink-0 border-r bg-white transition-[width] duration-200 ease-in-out dark:bg-[#0f1628] dark:border-white/10",
                            sidebarOpen ? "w-[300px]" : "w-[64px]",
                        ].join(" ")}
                    >
                        {/* Header do sidebar */}
                        <div className="flex items-center justify-between px-3 py-3">
                            {sidebarOpen ? (
                                <div className="text-xs font-semibold tracking-wide text-muted-foreground dark:text-white/60">
                                    MÓDULOS
                                </div>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={() => setSidebarOpen((v) => !v)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-primary transition hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                                title={sidebarOpen ? "Recolher" : "Abrir módulos"}
                                aria-label={sidebarOpen ? "Recolher sidebar" : "Abrir sidebar"}
                            >
                                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                            </button>
                        </div>

                        {/* ABERTO: lista completa */}
                        {sidebarOpen && (
                            <div className="h-[calc(100vh-220px)] overflow-y-auto px-2 pb-4">
                                <div className="space-y-1">
                                    {(modulos ?? []).map((m) => (
                                        <Collapsible
                                            key={m.id}
                                            defaultOpen={defaultOpenModuleId === m.id}
                                            className="group/collapsible"
                                        >
                                            <CollapsibleTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                                                >
                                                    <span className="truncate">
                                                        {m.ordem}. {m.nome}
                                                    </span>
                                                    <ChevronDown className="ml-auto size-4 opacity-60 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </button>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="mt-1 space-y-1 pl-2">
                                                    {(m.aulas ?? []).map((a) => {
                                                        const flatIndex = aulasFlat.findIndex((x) => x.id === a.id);
                                                        const locked = flatIndex > unlockedIndex;
                                                        const done = concluidasSet.has(a.id);
                                                        const isActive = a.id === aulaAtualId;

                                                        return (
                                                            <button
                                                                key={a.id}
                                                                type="button"
                                                                disabled={locked}
                                                                onClick={() => !locked && goToAula(a.id)}
                                                                className={[
                                                                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                                                                    locked
                                                                        ? "cursor-not-allowed opacity-40"
                                                                        : "hover:bg-black/5 dark:hover:bg-white/5",
                                                                    isActive
                                                                        ? "bg-black/5 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10"
                                                                        : "",
                                                                ].join(" ")}
                                                            >
                                                                <span className="truncate text-primary dark:text-white">
                                                                    {a.ordem}. {a.titulo}
                                                                </span>

                                                                <span className="shrink-0">
                                                                    {locked ? (
                                                                        <Lock size={14} className="opacity-70" />
                                                                    ) : done ? (
                                                                        <Check size={16} className="text-emerald-500" />
                                                                    ) : null}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FECHADO: rail clean (sem números feios) */}
                        {!sidebarOpen && (
                            <div className="px-2">
                                <div className="mt-2 rounded-xl border border-black/10 bg-black/5 p-2 text-center text-[11px] font-semibold text-primary dark:border-white/10 dark:bg-white/5 dark:text-white">
                                    Aulas
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* MAIN */}
                    <main className="min-w-0 flex-1 p-6">
                        <div className="mb-4 flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                className="w-auto"
                                disabled={!prevId}
                                onClick={() => prevId && goToAula(prevId)}
                            >
                                <ChevronLeft size={16} /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                className="w-auto"
                                disabled={!nextUnlockedId}
                                onClick={() => nextUnlockedId && goToAula(nextUnlockedId)}
                            >
                                Próxima <ChevronRight size={16} />
                            </Button>
                        </div>

                        <Card className="lg:w-full rounded-2xl border p-5 dark:border-white/10 dark:bg-dark">
                            {!aulaAtual ? (
                                <div className="text-muted-foreground dark:text-white/70">
                                    Nenhuma aula disponível.
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="text-lg font-semibold text-primary dark:text-white">
                                            Aula {aulaAtual.ordem}: {aulaAtual.titulo}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {grupos.videos.map((c) => (
                                            <div key={c.id} className="rounded-xl border p-4 dark:border-white/10">
                                                <YoutubeCustomPlayer
                                                    videoId={c.video_yt_id!}
                                                    onEnded={concluirEAvancar}
                                                />
                                            </div>
                                        ))}

                                        {grupos.textos.map((c) => (
                                            <div key={c.id} className="rounded-xl border p-4 dark:border-white/10">
                                                <pre className="whitespace-pre-wrap rounded-xl bg-black/10 p-4 text-sm text-foreground dark:bg-black/20 dark:text-white">
                                                    {c.texto ?? ""}
                                                </pre>
                                            </div>
                                        ))}

                                        {grupos.links.length > 0 && (
                                            <div className="rounded-xl border p-4 dark:border-white/10">
                                                <div className="mb-2 text-sm font-semibold text-primary dark:text-white">
                                                    Links
                                                </div>
                                                <ul className="space-y-2">
                                                    {grupos.links.map((c) => (
                                                        <li key={c.id} className="rounded-lg bg-black/5 p-3 dark:bg-white/5">
                                                            <a
                                                                className="break-all underline text-primary dark:text-white"
                                                                href={c.link_url ?? "#"}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {c.link_url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {grupos.anexos.length > 0 && (
                                            <div className="rounded-xl border p-4 dark:border-white/10">
                                                <div className="mb-2 text-sm font-semibold text-primary dark:text-white">
                                                    Anexos
                                                </div>

                                                <ul className="space-y-2">
                                                    {grupos.anexos.map((c) => {
                                                        const url = c.arquivo_path ? `/storage/${c.arquivo_path}` : "#";
                                                        return (
                                                            <li
                                                                key={c.id}
                                                                className="flex items-center justify-between gap-3 rounded-lg bg-black/5 p-3 dark:bg-white/5"
                                                            >
                                                                <div className="min-w-0">
                                                                    <div className="truncate text-primary dark:text-white">
                                                                        {c.arquivo_nome ?? "Arquivo"}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground dark:text-white/60">
                                                                        {c.arquivo_mime ?? "Arquivo"}
                                                                        {c.arquivo_size ? ` • ${formatBytes(c.arquivo_size)}` : ""}
                                                                    </div>
                                                                </div>

                                                                <a
                                                                    href={url}
                                                                    download={c.arquivo_nome ?? "arquivo"}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-primary transition hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                                                                    title="Baixar"
                                                                    aria-label="Baixar arquivo"
                                                                >
                                                                    <Download size={18} />
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}

                                        {conteudosOrdenados.length === 0 && (
                                            <div className="text-sm text-muted-foreground dark:text-white/70">
                                                Esta aula não possui conteúdos.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end border-t pt-4 dark:border-white/10">
                                        <Button className="w-auto" onClick={concluirAula}>
                                            <Check size={16} /> Marcar como concluída
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </main>
                </div>
            </DefaultLayout>
        </>
    );
}
