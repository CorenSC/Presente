import Form from '@/components/form';
import { Input } from '@/components/ui/input';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatarDataBrasileira, getTimeOptions } from '@/lib/utils';
import { Trash } from 'lucide-react';

type TipoEvento = 'presencial' | 'online' | 'hibrido';

type Atividade = {
    nome: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
};

type Curso = {
    nome: string;
    descricao: string;
    carga_horaria: string;
};

interface Props {
    evento: {
        id: number;
        nome: string;
        tipo: TipoEvento;
        descricao: string;
        local_do_evento: string;
        data_inicio: string;
        data_fim: string;
        hora_inicio: string;
        hora_fim: string;
        atividades: Atividade[];
        curso?: Curso | null;
    };
}

export default function EditarEvento({ evento }: Props) {
    const { data, setData, put } = useForm({
        nome: evento.nome,
        tipo: evento.tipo,
        descricao: evento.descricao,
        local_do_evento: evento.local_do_evento,
        data_inicio: evento.data_inicio,
        data_fim: evento.data_fim,
        hora_inicio: evento.hora_inicio?.slice(0, 5),
        hora_fim: evento.hora_fim?.slice(0, 5),
        atividades: evento.atividades ?? [],
        curso: evento.curso ?? null,
    });

    const hasCurso = data.tipo === 'online' || data.tipo === 'hibrido';
    const hasAtividades = data.tipo === 'presencial' || data.tipo === 'hibrido';

    const [showPicker, setShowPicker] =
        useState<'data_inicio' | 'data_fim' | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [validationErrors, setValidationErrors] = useState<any>(null);

    const adicionarAtividade = () => {
        setData('atividades', [
            ...data.atividades,
            {
                nome: '',
                data: '',
                hora_inicio: '',
                hora_fim: '',
            },
        ]);
    };

    const removerAtividade = (index: number) => {
        const novasAtividades = [...data.atividades];
        novasAtividades.splice(index, 1);
        setData('atividades', novasAtividades);
    };

    const atualizarAtividade = (index: number, campo: keyof Atividade, valor: string) => {
        const novasAtividades = [...data.atividades];
        novasAtividades[index][campo] = valor;
        setData('atividades', novasAtividades);
    };

    useEffect(() => {
        if (!hasCurso) {
            setData('curso', null);
        }

        if (hasCurso && data.curso === null) {
            setData('curso', {
                nome: '',
                descricao: '',
                carga_horaria: '',
            });
        }

        if (!hasAtividades) {
            setData('atividades', []);
        }
    }, [data.tipo]);


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('eventoUpdate', evento), {
            onError: (errors) => setValidationErrors(errors),
        });
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date && showPicker) {
            const formatted = format(date, 'dd/MM/yyyy');
            setData(showPicker, formatted);
            setShowPicker(null);
        }
    };

    const parseDate = (value: string) => {
        try {
            const parsed = parse(value, 'dd/MM/yyyy', new Date());
            return isValid(parsed) ? parsed : undefined;
        } catch {
            return undefined;
        }
    };

    const toggleDatePicker = (field: 'data_inicio' | 'data_fim') => {
        setShowPicker(showPicker === field ? null : field);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowPicker(null);
            }
        };
        const formattedEvent = {
            ...evento,
            nome: evento.nome,
            descricao: evento.descricao,
            local_do_evento: evento.local_do_evento,
            data_inicio: formatarDataBrasileira(evento.data_inicio),
            data_fim: formatarDataBrasileira(evento.data_fim),
            hora_inicio: evento.hora_inicio?.slice(0, 5) ?? '',
            hora_fim: evento.hora_fim?.slice(0, 5) ?? '',
            curso: evento.curso
                ? {
                    nome: evento.curso.nome,
                    descricao: evento.curso.descricao,
                    carga_horaria: evento.curso.carga_horaria,
                }
                : null,
        };
        if (evento.atividades && evento.atividades.length > 0) {
            formattedEvent.atividades = evento.atividades.map((atividade) => ({
                ...atividade,
                hora_inicio: atividade.hora_inicio.slice(0, 5),
                hora_fim: atividade.hora_fim.slice(0, 5),
            }));
        }

        setData(formattedEvent);
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <Head title="Editar evento" />
            <DefaultLayout className="flex flex-col items-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Editar evento</h1>

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

                <Form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        id="nome"
                        label="Nome do evento: *"
                        placeholder="Nome do evento"
                        required={true}
                        value={data.nome}
                        onChange={(e) => setData('nome', e.target.value)}
                    />
                    <Input
                        type="text"
                        id="local_do_evento"
                        label="Local do evento: *"
                        placeholder="Local do evento"
                        required={true}
                        value={data.local_do_evento}
                        onChange={(e) => setData('local_do_evento', e.target.value)}
                    />
                    <label htmlFor="descricao" className={'text-primary flex flex-col gap-2 dark:text-white'}>
                        Descrição do evento: *
                        <textarea
                            value={data.descricao}
                            onChange={(e) => setData('descricao', e.target.value)}
                            name="descricao"
                            className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows={4}
                            placeholder="Digite a descrição aqui..."
                            required={true}
                        ></textarea>
                    </label>

                    <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between" ref={containerRef}>
                        {(['data_inicio', 'data_fim'] as const).map((field) => (
                            <div key={field} className="w-full">
                                <Input
                                    type="text"
                                    readOnly={true}
                                    id={field}
                                    label={field === 'data_inicio' ? 'Data de início: *' : 'Data de fim: *'}
                                    required={true}
                                    value={data[field]}
                                    className="cursor-pointer"
                                    onClick={() => toggleDatePicker(field)}
                                    placeholder="dd/mm/aaaa"
                                    minLength={10}
                                />
                                {showPicker === field && (
                                    <div className="w-full shadow-lg xl:w-4/5">
                                        <DayPicker
                                            mode="single"
                                            selected={parseDate(data[field])}
                                            onSelect={handleDateSelect}
                                            locale={ptBR}
                                            modifiersClassNames={{
                                                selected: 'bg-primary text-white rounded-full',
                                                today: 'font-bold text-primary',
                                            }}
                                            className="rounded-lg border border-t-0 border-gray-200 bg-white p-3 text-gray-800 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Horários */}
                    <div className="flex gap-6">
                        {(['hora_inicio', 'hora_fim'] as const).map((field) => (
                            <div key={field} className="w-full">
                                <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                    {field === 'hora_inicio' ? 'Hora início: *' : 'Hora fim: *'}
                                    <Select value={data[field]} onValueChange={(v) => setData(field, v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getTimeOptions().map((h) => (
                                                <SelectItem key={h} value={h}>
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* TIPO (embaixo, antes do curso) */}
                    <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                        Tipo de evento: *
                        <Select value={data.tipo} onValueChange={(v) => setData('tipo', v as TipoEvento)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="presencial">Presencial</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="hibrido">Híbrido</SelectItem>
                            </SelectContent>
                        </Select>
                    </label>

                    {/* ATIVIDADES */}
                    {hasAtividades && (
                        <div className="relative rounded-md border p-4">
                            <h2 className="text-primary dark:text-white">Atividade(s)</h2>

                            {data.atividades.map((atividade, index) => (
                                <div key={index} className="relative p-4">
                                    <div className="grid gap-4">
                                        <Input
                                            type="text"
                                            label="Nome da atividade:"
                                            placeholder="Nome da atividade"
                                            value={atividade.nome}
                                            onChange={(e) => atualizarAtividade(index, 'nome', e.target.value)}
                                        />

                                        <Input
                                            type="date"
                                            label="Data:"
                                            value={atividade.data}
                                            onChange={(e) => atualizarAtividade(index, 'data', e.target.value)}
                                        />

                                        <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between">
                                            <div className="w-full">
                                                <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                                    Hora início:
                                                    <Select
                                                        value={atividade.hora_inicio.slice(0, 5) || ''}
                                                        onValueChange={(value) => atualizarAtividade(index, 'hora_inicio', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="--Selecione--" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getTimeOptions().map((hora) => (
                                                                <SelectItem key={hora} value={hora}>
                                                                    {hora}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </label>
                                            </div>

                                            <div className="w-full">
                                                <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                                    Hora fim:
                                                    <Select
                                                        value={atividade.hora_fim.slice(0, 5) || ''}
                                                        onValueChange={(value) => atualizarAtividade(index, 'hora_fim', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="--Selecione--" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getTimeOptions().map((hora) => (
                                                                <SelectItem key={hora} value={hora}>
                                                                    {hora}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => removerAtividade(index)}
                                        title="Remover"
                                        className="absolute top-2 right-2 flex h-8 w-12 items-center justify-center bg-red-800 text-white hover:bg-red-900"
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            ))}

                            <div className="mt-4 flex justify-end">
                                <Button type="button" onClick={adicionarAtividade} className="w-1/4">
                                    + Adicionar Atividade
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* CURSO */}
                    {hasCurso && (
                        <div className="grid gap-4 rounded-md border p-4">
                            <h2 className="text-primary dark:text-white">Curso</h2>

                            <Input
                                label="Nome: "
                                value={data.curso?.nome}
                                onChange={(e) =>
                                    setData('curso', {
                                        ...data.curso!,
                                        nome: e.target.value,
                                    })
                                }
                            />

                            <label htmlFor="descricao" className={'text-primary flex flex-col gap-2 dark:text-white'}>
                                Descrição do Curso:
                                <textarea
                                    className="rounded-md border p-2"
                                    rows={3}
                                    value={data.curso?.descricao ?? ''}
                                    onChange={(e) =>
                                        setData('curso', {
                                            ...data.curso!,
                                            descricao: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <Input
                                type="number"
                                label="Carga horária:"
                                value={data.curso?.carga_horaria ?? ''}
                                onChange={(e) =>
                                    setData('curso', {
                                        ...data.curso!,
                                        carga_horaria: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}

                    <Button type="submit">Atualizar evento</Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
