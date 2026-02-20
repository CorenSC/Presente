import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, Lock, Play } from 'lucide-react';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

type Aula = { id: number; titulo: string; ordem: number };
type Modulo = { id: number; nome: string; ordem: number; aulas: Aula[] };

type Props = {
    evento: { id: number; nome: string };
    curso: { id: number; nome: string; descricao?: string | null; carga_horaria: number };
    modulos: Modulo[];
    concluidasIds: number[];
    unlockedIndex: number;
};

export default function CursoOverview() {
    const { evento, curso, modulos, concluidasIds, unlockedIndex } = usePage<Props>().props;

    const concluidasSet = useMemo(() => new Set(concluidasIds ?? []), [concluidasIds]);

    const flatIndexByAulaId = useMemo(() => {
        const map = new Map<number, number>();
        let i = 0;
        (modulos ?? []).forEach((m) => {
            (m.aulas ?? []).forEach((a) => {
                map.set(a.id, i);
                i++;
            });
        });
        return map;
    }, [modulos]);

    const isUnlocked = (aulaId: number) => {
        const idx = flatIndexByAulaId.get(aulaId);
        if (idx === undefined) return false;
        return idx <= unlockedIndex;
    };

    return (
        <>
            <Head title={`Curso - ${curso.nome}`} />
            <DefaultFormCadastro>
                <div className="mx-auto max-w-5xl px-2 py-6 space-y-4 lg:px-4">
                    <Card className="rounded-2xl p-5 w-full dark:bg-dark lg:w-full">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                            <div className="mt-3 text-xs text-muted-foreground dark:text-white/70">Curso</div>
                                <div className="text-primary text-lg font-bold dark:text-white">{curso.nome}</div>

                                {curso.descricao ? (
                                    <div className="mt-2 text-xs text-muted-foreground dark:text-white/70">
                                        {curso.descricao}
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {curso.carga_horaria ?? 0}h
                                </span>
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {modulos.length} módulos
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl p-5 dark:bg-dark w-full lg:w-full">
                        <div className="mb-3 text-sm font-semibold text-primary dark:text-white">Módulos</div>

                        <Accordion type="multiple" className="w-full space-y-2">
                            {modulos.map((m) => (
                                <AccordionItem key={m.id} value={`mod-${m.id}`} className="rounded-xl border dark:border-white/10">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                        <div className="flex w-full items-center gap-3">
                                            <span className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold dark:bg-white/10 dark:text-white">
                                                {m.ordem}
                                            </span>
                                            <div className="text-left">
                                                <div className="text-primary font-semibold dark:text-white">{m.nome}</div>
                                                <div className="text-xs text-muted-foreground dark:text-white/70">
                                                    {m.aulas.length} aulas
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2">
                                            {m.aulas.map((a) => {
                                                const done = concluidasSet.has(a.id);
                                                const unlocked = isUnlocked(a.id);

                                                return (
                                                    <div
                                                        key={a.id}
                                                        className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm dark:border-white/10 ${unlocked ? 'opacity-100' : 'opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {done ? (
                                                                <Check size={16} className="text-emerald-500" />
                                                            ) : unlocked ? (
                                                                <Play size={16} className="opacity-70" />
                                                            ) : (
                                                                <Lock size={16} className="opacity-70" />
                                                            )}

                                                            <div className="truncate text-primary dark:text-white">
                                                                {a.ordem}. {a.titulo}
                                                            </div>
                                                        </div>

                                                        {unlocked ? (
                                                            <Button asChild size="sm" >
                                                                <Link
                                                                    href={route('participanteCursoPlayer', { evento: evento.id, aula: a.id })}
                                                                >
                                                                    Assistir
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground dark:text-white/60">
                                                                Bloqueada
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <div className="pt-4">
                            <Button variant="link" size='sm'>
                                <Link
                                    href={route('participanteEventos')}
                                >
                                    ← Voltar para Meus Eventos
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </DefaultFormCadastro>
        </>
    );
}
