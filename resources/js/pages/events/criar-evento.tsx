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
import { Trash } from 'lucide-react';
import { getTimeOptions } from '@/lib/utils';

type Atividade = {
    nome: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
};

export default function CriarEvento() {
    const { data, setData, post } = useForm<{
        nome: string;
        data_inicio: string;
        descricao: string;
        data_fim: string;
        local_do_evento: string;
        hora_inicio: string;
        hora_fim: string;
        atividades: Atividade[];
    }>({
        nome: '',
        data_inicio: '',
        descricao: '',
        data_fim: '',
        local_do_evento: '',
        hora_inicio: '',
        hora_fim: '',
        atividades: []
    });

    const [showPicker, setShowPicker] = useState<'data_inicio' | 'data_fim' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [validationErrors, setValidationErrors] = useState(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('eventoStore'), {
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

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // @ts-ignore
    return (
        <>
            <Head title="Criar evento" />
            <DefaultLayout className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Criar evento</h1>
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
                    <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between">
                        <div className="w-full">
                            <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                Hora início: *
                                <Select value={data.hora_inicio} onValueChange={(value) => setData('hora_inicio', value)}>
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
                            <div key={index}>
                                <div className="relative p-4">
                                    <div className="grid gap-4">
                                        <Input
                                            type="text"
                                            label="Nome da atividade:"
                                            placeholder="SEMAD"
                                            value={atividade.nome}
                                            onChange={(e) => {
                                                const novas = [...data.atividades];
                                                novas[index].nome = e.target.value;
                                                setData('atividades', novas);
                                            }}
                                        />
                                        <Input
                                            type="date"
                                            id="data"
                                            label={'Data:'}
                                            required={true}
                                            value={atividade.data}
                                            className="cursor-pointer"
                                            onChange={(e) => {
                                                const novas = [...data.atividades];
                                                novas[index].data = e.target.value;
                                                setData('atividades', novas);
                                            }}
                                            placeholder="dd/mm/aaaa"
                                            minLength={10}
                                        />
                                        <div className="flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between">
                                            <div className="w-full">
                                                <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                                    Hora início:
                                                    <Select
                                                        value={atividade.hora_inicio}
                                                        onValueChange={(e) => {
                                                            const novas = [...data.atividades];
                                                            novas[index].hora_inicio = e;
                                                            setData('atividades', novas);
                                                        }}
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
                                                        value={atividade.hora_fim}
                                                        onValueChange={(e) => {
                                                            const novas = [...data.atividades];
                                                            novas[index].hora_fim = e;
                                                            setData('atividades', novas);
                                                        }}
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
                                        onClick={() => {
                                            const novas = data.atividades.filter((_, i) => i !== index);
                                            setData('atividades', novas);
                                        }}
                                        title={'Remover'}
                                        className="absolute top-2 right-2 flex h-8 w-12 items-center justify-center bg-red-800 text-center text-sm text-white hover:bg-red-900"
                                    >
                                        <Trash className="w-5" />
                                    </Button>
                                </div>
                                {index < data.atividades.length - 1 && <hr className="border-primary border-t dark:border-gray-600" />}
                            </div>
                        ))}
                        {data.atividades.length === 1 && <hr className="border-primary border-t dark:border-gray-600 mb-4" />}
                        <div className="flex justify-end">
                        <Button
                                type="button"
                                className="w-1/4"
                                onClick={() =>
                                    setData('atividades', [
                                        ...data.atividades,
                                        {
                                            nome: '',
                                            data: '',
                                            hora_inicio: '',
                                            hora_fim: '',
                                        },
                                    ])
                                }
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

