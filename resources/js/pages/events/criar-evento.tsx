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

export default function CriarEvento() {
    const { data, setData, post } = useForm({
        nome: '',
        dataInicio: '',
        dataFim: '',
        local: '',
        horaInicio: '',
        horaFim: '',
    });

    const [showPicker, setShowPicker] = useState<'dataInicio' | 'dataFim' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('eventoStore'), {
            onError: (errors) => {
                console.error('Erros de validação:', errors);
            },
            onSuccess: (data) => {
                console.log('Sucesso!', data.message);
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

    const toggleDatePicker = (field: 'dataInicio' | 'dataFim') => {
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

    return (
        <>
            <Head title="Criar evento" />
            <DefaultLayout className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Criar evento</h1>
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
                        id="local"
                        label="Local do evento: *"
                        placeholder="Local do evento"
                        required={true}
                        value={data.local}
                        onChange={(e) => setData('local', e.target.value)}
                    />

                    <div className="flex flex-col w-full justify-center gap-6 lg:flex-row lg:justify-between"
                         ref={containerRef}>
                        {(['dataInicio', 'dataFim'] as const).map((field) => (
                            <div key={field} className="w-full">
                                <Input
                                    type="text"
                                    id={field}
                                    label={field === 'dataInicio' ? 'Data de início: *' : 'Data de fim: *'}
                                    required={true}
                                    value={data[field]}
                                    className="cursor-pointer"
                                    onClick={() => toggleDatePicker(field)}
                                    placeholder="dd/mm/aaaa"
                                    minLength={10}
                                />
                                {showPicker === field && (
                                    <div className="shadow-lg">
                                        <DayPicker
                                            mode="single"
                                            selected={parseDate(data[field])}
                                            onSelect={handleDateSelect}
                                            locale={ptBR}
                                            modifiersClassNames={{
                                                selected: 'bg-primary text-white rounded-full',
                                                today: 'font-bold text-primary',
                                            }}
                                            className="border border-gray-200 rounded-lg bg-white p-3 dark:bg-gray-800 text-gray-800 dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col w-full justify-center gap-6 lg:flex-row lg:justify-between">
                        <div className='w-full'>
                            <Input
                                type="text"
                                id="horaInicio"
                                label="Hora do início: *"
                                placeholder="08:00"
                                required={true}
                                value={data.horaInicio}
                                onChange={(e) => setData('horaInicio', e.target.value)}
                                list="timeOptions"
                            />
                        </div>
                        <div className='w-full'>
                            <Input
                                type="text"
                                id="horaFim"
                                label="Hora do fim: *"
                                placeholder="08:00"
                                required={true}
                                value={data.horaFim}
                                onChange={(e) => setData('horaFim', e.target.value)}
                                list="timeOptions"
                            />
                        </div>
                        <datalist id="timeOptions">
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = 8 + Math.floor(i / 2);
                                const minute = i % 2 === 0 ? '00' : '30';
                                if (hour > 19 || (hour === 19 && minute !== '00')) return null;
                                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                return <option key={time} value={time} />;
                            })}
                        </datalist>
                    </div>

                    <Button type="submit">
                        Cadastrar
                    </Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
