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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Trash } from 'lucide-react';
import { getTimeOptions } from '@/lib/utils';

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

export default function CriarEvento() {
    const { data, setData, post } = useForm<{
        nome: string;
        tipo: 'presencial' | 'hibrido' | 'online';
        possui_curso: 'true' | 'false'; // 👈 SOMENTE FRONT
        data_inicio: string;
        data_fim: string;
        descricao: string;
        local_do_evento: string;
        hora_inicio: string;
        hora_fim: string;
        atividades: Atividade[];
        curso: Curso | null;
    }>({
        nome: '',
        tipo: 'presencial',
        possui_curso: 'false',
        data_inicio: '',
        data_fim: '',
        descricao: '',
        local_do_evento: '',
        hora_inicio: '',
        hora_fim: '',
        atividades: [],
        curso: null,
    });

    const [showPicker, setShowPicker] = useState<'data_inicio' | 'data_fim' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [validationErrors, setValidationErrors] = useState<any>(null);

    const hasCurso = data.possui_curso === 'true';
    const hasAtividades = data.tipo === 'presencial' || data.tipo === 'hibrido';

    /* ======= CONTROLE CURSO (FRONT ONLY) ======= */
    useEffect(() => {
        if (hasCurso && !data.curso) {
            setData('curso', { nome: '', descricao: '', carga_horaria: '' });
        }

        if (!hasCurso && data.curso) {
            setData('curso', null);
        }
    }, [data.possui_curso]);

    /* ======= CONTROLE ATIVIDADES ======= */
    useEffect(() => {
        if (!hasAtividades && data.atividades.length > 0) {
            setData('atividades', []);
        }
    }, [data.tipo]);

    /* ======= SUBMIT ======= */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(route('eventoStore'), {
            onError: (errors) => setValidationErrors(errors),
        });
    };

    /* ======= DATA PICKER ======= */
    const handleDateSelect = (date: Date | undefined) => {
        if (date && showPicker) {
            setData(showPicker, format(date, 'dd/MM/yyyy'));
            setShowPicker(null);
        }
    };

    const parseDate = (value: string) => {
        const parsed = parse(value, 'dd/MM/yyyy', new Date());
        return isValid(parsed) ? parsed : undefined;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <Head title="Criar evento" />

            <DefaultLayout className="flex flex-col items-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Criar evento</h1>

                {validationErrors && (
                    <Alert>
                        <AlertTitle>Erros de validação</AlertTitle>
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
                        label="Nome do evento: *"
                        value={data.nome}
                        onChange={(e) => setData('nome', e.target.value)}
                        required
                    />

                    <Input
                        label="Local do evento: *"
                        value={data.local_do_evento}
                        onChange={(e) => setData('local_do_evento', e.target.value)}
                        required
                    />

                    <label className="text-primary flex flex-col gap-2 text-base dark:text-white">
                        Descrição: *
                        <textarea
                            className="rounded-md border p-2"
                            rows={4}
                            value={data.descricao}
                            onChange={(e) => setData('descricao', e.target.value)}
                            required
                        />
                    </label>

                    {/* DATAS */}
                    <div ref={containerRef} className="flex w-full gap-6">
                        {(['data_inicio', 'data_fim'] as const).map((field) => (
                            <div key={field} className="w-full">
                                <Input
                                    readOnly
                                    label={field === 'data_inicio' ? 'Data início: *' : 'Data fim: *'}
                                    value={data[field]}
                                    onClick={() => setShowPicker(field)}
                                    placeholder="dd/mm/aaaa"
                                />
                                {showPicker === field && (
                                    <div className="w-full shadow-lg">
                                        <DayPicker
                                            mode="single"
                                            locale={ptBR}
                                            selected={parseDate(data[field])}
                                            onSelect={handleDateSelect}
                                            className="rounded-lg border bg-white p-3 dark:bg-gray-800"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* HORÁRIOS */}
                    <div className="flex w-full gap-6">
                        {(['hora_inicio', 'hora_fim'] as const).map((field) => (
                            <div key={field} className="w-full">
                                <label className="text-primary flex flex-col gap-2 dark:text-white">
                                    {field === 'hora_inicio' ? 'Hora início: *' : 'Hora fim: *'}
                                    <Select value={data[field]} onValueChange={(v) => setData(field, v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
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

                    {/* TIPO */}
                    <label className="text-primary flex flex-col gap-2 dark:text-white">
                        Tipo de evento *
                        <Select value={data.tipo} onValueChange={(v) => setData('tipo', v as any)}>
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

                    {/* POSSUI CURSO */}
                    <label className="text-primary flex flex-col gap-2 dark:text-white">
                        Possui curso *
                        <Select
                            value={data.possui_curso}
                            onValueChange={(v) => setData('possui_curso', v as 'true' | 'false')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sim</SelectItem>
                                <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                        </Select>
                    </label>

                    {/* ATIVIDADES */}
                    {hasAtividades && (
                        <div className="rounded-md border p-4">
                            <h2 className="text-primary dark:text-white">Atividades</h2>

                            {data.atividades.map((atividade, index) => (
                                <div key={index} className="relative p-4">
                                    <Input
                                        label="Nome da atividade"
                                        value={atividade.nome}
                                        onChange={(e) => {
                                            const a = [...data.atividades];
                                            a[index].nome = e.target.value;
                                            setData('atividades', a);
                                        }}
                                    />

                                    <Input
                                        type="date"
                                        label="Data"
                                        value={atividade.data}
                                        onChange={(e) => {
                                            const a = [...data.atividades];
                                            a[index].data = e.target.value;
                                            setData('atividades', a);
                                        }}
                                    />

                                    <div className="flex gap-4">
                                        {(['hora_inicio', 'hora_fim'] as const).map((h) => (
                                            <label key={h} className="text-primary flex w-full flex-col gap-2 dark:text-white">
                                                {h === 'hora_inicio' ? 'Hora início' : 'Hora fim'}
                                                <Select
                                                    value={atividade[h]}
                                                    onValueChange={(v) => {
                                                        const a = [...data.atividades];
                                                        a[index][h] = v;
                                                        setData('atividades', a);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getTimeOptions().map((t) => (
                                                            <SelectItem key={t} value={t}>
                                                                {t}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </label>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'atividades',
                                                data.atividades.filter((_, i) => i !== index),
                                            )
                                        }
                                        className="absolute top-2 right-2 bg-red-700 hover:bg-red-800"
                                    >
                                        <Trash size={16} />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                className="mt-4"
                                onClick={() =>
                                    setData('atividades', [
                                        ...data.atividades,
                                        { nome: '', data: '', hora_inicio: '', hora_fim: '' },
                                    ])
                                }
                            >
                                + Adicionar Atividade
                            </Button>
                        </div>
                    )}

                    {/* CURSO */}
                    {hasCurso && data.curso && (
                        <div className="grid gap-4 rounded-md border p-4">
                            <h2 className="text-primary dark:text-white">Curso</h2>

                            <Input
                                label="Nome do curso"
                                value={data.curso.nome}
                                onChange={(e) =>
                                    setData('curso', { ...data.curso!, nome: e.target.value })
                                }
                            />

                            <label className="text-primary flex flex-col gap-2 dark:text-white">
                                Descrição
                                <textarea
                                    className="rounded-md border p-2"
                                    rows={4}
                                    value={data.curso.descricao}
                                    onChange={(e) =>
                                        setData('curso', { ...data.curso!, descricao: e.target.value })
                                    }
                                />
                            </label>

                            <Input
                                type="number"
                                label="Carga horária (h)"
                                value={data.curso.carga_horaria}
                                onChange={(e) =>
                                    setData('curso', {
                                        ...data.curso!,
                                        carga_horaria: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}

                    <Button type="submit">Cadastrar evento</Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
