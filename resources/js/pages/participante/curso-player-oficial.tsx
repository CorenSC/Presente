import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    flash?: { success?: string };
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

export default function CursoPlayerOficial() {
    const { flash, evento, curso, aulaAtualId, concluidasIds, modulos, unlockedIndex } =
        usePage<PageProps>().props;

    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ✅ no mobile, começa fechado (desktop segue igual após montar)
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, []);

    const concluidasSet = useMemo(
        () => new Set<number>((concluidasIds ?? []).map(Number)),
        [concluidasIds]
    );

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

    const prevUnlockedId = useMemo(() => {
        if (idxAtual <= 0) return null;
        return aulasFlat[idxAtual - 1]?.id ?? null;
    }, [idxAtual, aulasFlat]);

    const nextUnlockedId = useMemo(() => {
        if (idxAtual < 0) return null;
        const nextIndex = idxAtual + 1;
        if (nextIndex > unlockedIndex) return null;
        return aulasFlat[nextIndex]?.id ?? null;
    }, [idxAtual, aulasFlat, unlockedIndex]);

    const goToAula = (id: number) => {
        router.get(
            route("participanteCursoPlayer", { evento: evento.id }),
            { aula: id },
            { preserveScroll: true, preserveState: true }
        );

        // ✅ ao clicar numa aula no mobile, fecha o drawer
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const concluirAula = () => {
        if (!aulaAtual) return;
        router.post(route("participanteAulaConcluir", { aula: aulaAtual.id }), {}, { preserveScroll: true });
    };

    const concluirEAvancar = () => {
        if (!aulaAtual) return;
        router.post(
            route("participanteAulaConcluir", { aula: aulaAtual.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (nextUnlockedId) goToAula(nextUnlockedId);
                },
            }
        );
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

    const sidebarWidth = sidebarOpen ? 320 : 72;

    // ✅ paddingLeft só no desktop (resolve o “conteúdo pra direita” no mobile)
    const desktopPaddingLeft =
        typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarWidth : 0;

    return (
        <>
            <Head title={curso?.nome ?? "Curso"} />

            {/* Wrapper sem layout */}
            <div className="min-h-screen bg-background">
                <header className="bg-primary min-w-full h-6"></header>

                {/* ✅ Botão fixo no mobile pra abrir o drawer */}
                {!sidebarOpen ? (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden fixed left-3 top-3 z-50 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-md"
                        aria-label="Abrir módulos"
                        title="Abrir módulos"
                    >
                        <PanelLeftOpen size={18} />
                        Módulos
                    </button>
                ) : null}

                {/* Sidebar fixo */}
                <aside
                    className={[
                        "fixed left-0 top-0 z-40 h-screen border-r bg-white shadow-sm transition-[width] duration-200 ease-in-out",
                        "dark:bg-[#0f1628] dark:border-white/10",
                        sidebarOpen ? "w-[320px]" : "w-[72px]",

                        // ✅ MOBILE: vira drawer (entra/sai). Desktop fica igual.
                        "max-lg:w-[85%] max-lg:max-w-[320px]",
                        "max-lg:transition-transform max-lg:duration-200 max-lg:ease-in-out",
                        sidebarOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
                    ].join(" ")}
                >
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

                    {sidebarOpen ? (
                        <div className="h-[calc(100vh-60px)] overflow-y-auto px-2 pb-4">
                            <div className="mb-3 px-2">
                                <div className="truncate text-sm font-semibold text-primary dark:text-white">
                                    {curso?.nome ?? "Curso"}
                                </div>
                            </div>

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
                    ) : (
                        <div className="px-2">
                            <div className="mt-2 rounded-xl border border-black/10 bg-black/5 p-2 text-center text-[11px] font-semibold text-primary dark:border-white/10 dark:bg-white/5 dark:text-white">
                                Aulas
                            </div>
                        </div>
                    )}
                </aside>

                {/* ✅ Overlay mobile pra fechar tocando fora */}
                {sidebarOpen ? (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                        aria-label="Fechar menu"
                    />
                ) : null}

                {/* Main com offset do sidebar */}
                <main style={{ paddingLeft: desktopPaddingLeft }} className="min-h-screen">
                    <div className="mx-auto w-full px-3 py-4 sm:px-6 lg:w-[75%]">
                        {flash?.success ? (
                            <Alert className="mb-4" variant="success">
                                <AlertTitle variant="success">Sucesso</AlertTitle>
                                <AlertDescription>{flash.success}</AlertDescription>
                            </Alert>
                        ) : null}

                        {/* Top bar */}
                        <div className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="truncate text-lg font-bold text-primary dark:text-white">
                                    {curso?.nome ?? "Curso"}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button asChild variant="outline" className="w-auto">
                                    <Link href={route("participanteCursoOverview", { evento: evento.id })}>Ver módulos</Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-auto"
                                    disabled={!prevUnlockedId}
                                    onClick={() => prevUnlockedId && goToAula(prevUnlockedId)}
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
                        </div>

                        {/* Conteúdo centralizado */}
                        <Card className="w-full rounded-2xl border p-4 sm:p-5 shadow-sm dark:border-white/10 dark:bg-dark">
                            {!aulaAtual ? (
                                <div className="text-muted-foreground dark:text-white/70">Nenhuma aula disponível.</div>
                            ) : (
                                <>
                                    <div className="">
                                        <div className="text-lg font-semibold text-primary dark:text-white">
                                            Aula {aulaAtual.ordem}: {aulaAtual.titulo}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {grupos.videos.map((c) => (
                                            <div key={c.id} className="">
                                                <YoutubeCustomPlayer videoId={c.video_yt_id!} onEnded={concluirEAvancar} />
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
                                                <div className="mb-2 text-sm font-semibold text-primary dark:text-white">Links</div>
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
                                                <div className="mb-2 text-sm font-semibold text-primary dark:text-white">Anexos</div>

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

                                    <div className="mt-4 flex items-center justify-between border-t pt-4 dark:border-white/10 max-lg:flex-col max-lg:items-start max-lg:gap-3">
                                        <div className="text-xs text-muted-foreground dark:text-white/60">
                                            Dica: quando o vídeo terminar, a aula é concluída automaticamente (e avança se houver próxima).
                                        </div>

                                        <Button className="w-auto max-lg:w-full" onClick={concluirAula}>
                                            <Check size={16} /> Marcar como concluída
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </main>

                <footer className="bg-primary text-white text-sm py-4 px-6 text-center dark:bg-[#1B2C40]">
                    © {new Date().getFullYear()} Coren-SC | Todos os direitos reservados.
                </footer>
            </div>
        </>
    );
}
