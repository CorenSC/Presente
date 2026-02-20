import React, { useMemo } from "react";
import { router } from "@inertiajs/react";
import { Check, Lock, BookOpen } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

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

type Props = {
    eventoId: number;
    modulos: Modulo[];
    aulaAtualId: number | null;
    concluidasIds: number[];
    unlockedIndex: number;
};

export function AppSidebar({ eventoId, modulos, aulaAtualId, concluidasIds, unlockedIndex }: Props) {
    const concluidasSet = useMemo(() => new Set(concluidasIds ?? []), [concluidasIds]);

    // lista flat em ordem (pra respeitar unlockedIndex)
    const aulasFlat = useMemo(() => {
        const list: Aula[] = [];
        (modulos ?? []).forEach((m) => (m.aulas ?? []).forEach((a) => list.push(a)));
        return list;
    }, [modulos]);

    const goToAula = (id: number) => {
        router.get(route("cursoPlayer", { evento: eventoId }), { aula: id }, { preserveScroll: true, preserveState: true });
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-2 py-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive>
                            <BookOpen />
                            <span>Conteúdo</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {(modulos ?? []).map((m) => (
                    <SidebarGroup key={m.id}>
                        <SidebarGroupLabel>
                            {m.ordem}. {m.nome}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {(m.aulas ?? []).map((a) => {
                                    const flatIndex = aulasFlat.findIndex((x) => x.id === a.id);
                                    const locked = flatIndex > unlockedIndex;
                                    const done = concluidasSet.has(a.id);
                                    const isActive = a.id === aulaAtualId;

                                    return (
                                        <SidebarMenuItem key={a.id}>
                                            <SidebarMenuButton
                                                isActive={isActive}
                                                disabled={locked}
                                                onClick={() => !locked && goToAula(a.id)}
                                                tooltip={`${a.ordem}. ${a.titulo}`}
                                            >
                                                {locked ? <Lock /> : done ? <Check /> : <BookOpen />}
                                                <span className="truncate">
                                                    {a.ordem}. {a.titulo}
                                                </span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
