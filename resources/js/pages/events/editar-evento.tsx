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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { formatarDataBrasileira, getTimeOptions } from '@/lib/utils';
import { Trash } from 'lucide-react';

type Atividade = {
    nome: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
};
interface Evento {
    id: number;
    nome: string;
    descricao: string;
    local_do_evento: string;
    data_inicio: string;
    data_fim: string;
    hora_inicio: string;
    hora_fim: string;
    atividades: Atividade[];
}

interface EditarEventoProps {
    evento: Evento;
}


export default function EditarEvento({evento}: EditarEventoProps) {
    const { data, setData, put } = useForm({
        nome: evento.nome || '',
        descricao: evento.descricao || '',
        data_inicio: evento.data_inicio || '',
        data_fim: evento.data_fim || '',
        local_do_evento: evento.local_do_evento || '',
        hora_inicio: evento.hora_inicio?.slice(0, 5) || '',
        hora_fim: evento.hora_fim?.slice(0, 5) || '',
        atividades: evento.atividades || [] // Adicione esta linha
    });

    const [showPicker, setShowPicker] = useState<'data_inicio' | 'data_fim' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [validationErrors, setValidationErrors] = useState(null);

    const adicionarAtividade = () => {
        setData('atividades', [
            ...data.atividades,
            { nome: '', data: '', hora_inicio: '', hora_fim: '' }
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        put(route('eventoUpdate', evento), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
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
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPicker(null);
            }
        };
        const formattedEvent = {
            ...evento,
            data_inicio: formatarDataBrasileira(evento.data_inicio),
            data_fim: formatarDataBrasileira(evento.data_fim),
            hora_inicio: evento.hora_inicio?.slice(0, 5), // Formata HH:MM:SS para HH:MM
            hora_fim: evento.hora_fim?.slice(0, 5),
        };
        if (evento.atividades && evento.atividades.length > 0) {
            formattedEvent.atividades = evento.atividades.map(atividade => ({
                ...atividade,
                hora_inicio: atividade.hora_inicio.slice(0,5),
                hora_fim: atividade.hora_fim,
            }));
        }
        setData(formattedEvent);
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, []);

    // @ts-ignore
    return (
        <>
            <Head title={'Editar evento'} />
            <DefaultLayout className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Editar evento ID: {evento.id}</h1>
                {validationErrors && (
                    <Alert>
                        <AlertTitle>Erros de Validação</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4">
                                {Object.values(validationErrors).map((error, index) => (
                                    // @ts-ignore
                                    <li key={index}>{error}</li>
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

                    <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between"
                         ref={containerRef}>
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
                    <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between">
                        <div className="w-full">
                            <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                Hora início: *
                                <Select value={data.hora_inicio}
                                        onValueChange={(value) => setData('hora_inicio', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                Hora fim: *
                                <Select value={data.hora_fim} onValueChange={(value) => setData('hora_fim', value)}>
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
                                    <div
                                        className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between">
                                        <div className="w-full">
                                            <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                                Hora início:
                                                <Select
                                                    value={atividade.hora_inicio.slice(0,5)}
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
                                                    value={atividade.hora_fim.slice(0,5)}
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
                                    className="absolute top-2 right-2 flex h-8 w-12 items-center justify-center bg-red-800 text-center text-sm text-white hover:bg-red-900"
                                >
                                    <Trash className="w-5" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                onClick={adicionarAtividade}
                                className="w-1/4"
                            >
                                + Adicionar Atividade
                            </Button>
                        </div>
                    </div>

                    <Button type="submit">Cadastrar</Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
