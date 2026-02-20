import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Lock, Play } from 'lucide-react';

type Aula = { id: number; titulo: string; ordem: number; publicada?: boolean };
type Modulo = { id: number; nome: string; ordem: number; aulas: Aula[] };

type Props = {
    flash?: { success?: string };
    evento: { id: number; nome: string };
    curso: {
        id: number;
        nome: string;
        descricao?: string | null;
        carga_horaria: number;
        modulos: Modulo[];
    };
    concluidas_ids: number[];
    proxima_liberada_id: number | null;
};

export default function CursoPlayerParticipante() {
    const { flash, evento, curso, concluidas_ids, proxima_liberada_id } = usePage<Props>().props;

    const concluidasSet = useMemo(() => new Set(concluidas_ids ?? []), [concluidas_ids]);

    const isLiberada = (aulaId: number) => {
        // se já concluiu, está liberada
        if (concluidasSet.has(aulaId)) return true;
        // se não concluiu, só libera a "próxima" (primeira não concluída)
        return proxima_liberada_id === aulaId;
    };

    const concluir = (aulaId: number) => {
        router.post(route('participanteAulaConcluir', { aula: aulaId }), {}, { preserveScroll: true });
    };

    const desconcluir = (aulaId: number) => {
        router.delete(route('participanteAulaDesconcluir', { aula: aulaId }), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Curso - ${curso?.nome ?? 'Curso'}`} />

            <DefaultFormCadastro>
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
                    {flash?.success ? (
                        <Alert className="justify-self-center" variant="success">
                            <AlertTitle variant="success">Sucesso</AlertTitle>
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Card className="dark:bg-dark rounded-2xl p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="text-xs text-muted-foreground dark:text-white/70">Evento</div>
                                <div className="text-primary text-lg font-semibold dark:text-white">{evento.nome}</div>

                                <div className="mt-3 text-xs text-muted-foreground dark:text-white/70">Curso</div>
                                <div className="text-primary text-xl font-bold dark:text-white">{curso.nome}</div>

                                {curso.descricao ? (
                                    <div className="mt-2 text-sm text-muted-foreground dark:text-white/70">{curso.descricao}</div>
                                ) : null}
                            </div>

                            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {curso.carga_horaria ?? 0}h
                                </span>
                                <span className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-medium dark:bg-white/10 dark:text-white">
                                    {curso.modulos?.length ?? 0} módulos
                                </span>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        {curso.modulos.map((m) => (
                            <Card key={m.id} className="dark:bg-dark rounded-2xl p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold dark:bg-white/10 dark:text-white">
                                            {m.ordem}
                                        </span>
                                        <div>
                                            <div className="text-primary font-semibold dark:text-white">{m.nome}</div>
                                            <div className="text-xs text-muted-foreground dark:text-white/70">
                                                {m.aulas?.length ?? 0} aulas
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {(m.aulas ?? []).map((a) => {
                                        const concluida = concluidasSet.has(a.id);
                                        const liberada = isLiberada(a.id);
                                        const bloqueada = !liberada;

                                        return (
                                            <div
                                                key={a.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 dark:border-white/10"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {concluida ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                <Check size={16} />
                                                            </span>
                                                        ) : bloqueada ? (
                                                            <span className="text-muted-foreground dark:text-white/50">
                                                                <Lock size={16} />
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground dark:text-white/70">
                                                                <Play size={16} />
                                                            </span>
                                                        )}

                                                        <div className="text-sm text-primary dark:text-white truncate">
                                                            {a.ordem}. {a.titulo}
                                                        </div>
                                                    </div>

                                                    {!liberada && (
                                                        <div className="mt-1 text-xs text-muted-foreground dark:text-white/60">
                                                            Conclua a aula anterior para liberar.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant={liberada ? 'secondary' : 'outline'}
                                                        disabled={!liberada}
                                                        onClick={() => {
                                                            // ✅ aqui você liga na sua rota real de "assistir aula"
                                                            // Exemplo: route('participante.conteudos', { aula: a.id })
                                                            router.visit(route('conteudosGerenciar', { aula: a.id })); // TROQUE para a rota do participante
                                                        }}
                                                    >
                                                        Assistir
                                                    </Button>

                                                    {concluida ? (
                                                        <Button size="sm" variant="outline" onClick={() => desconcluir(a.id)}>
                                                            Desfazer
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" onClick={() => concluir(a.id)} disabled={!liberada}>
                                                            Concluir
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="pt-2">
                        <Link
                            href={route('eventosCadastrados')}
                            className="text-sm text-muted-foreground hover:underline dark:text-white/70"
                        >
                            ← Voltar para Meus Eventos
                        </Link>
                    </div>
                </div>
            </DefaultFormCadastro>
        </>
    );
}
