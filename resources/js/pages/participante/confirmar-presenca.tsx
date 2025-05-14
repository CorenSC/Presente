import { Head, useForm } from '@inertiajs/react';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import Form from '@/components/form';
import { FormEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { formatCPF } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Evento = {
    nome: string;
    id: number;
}

interface EventoProps {
    evento: Evento;
}

//@ts-ignore
export default function ConfirmarPresenca({evento}: EventoProps) {
    const { data, setData, put } = useForm<{
        cpf: string;
    }>({
        cpf: '',
    });

    const [validationErrors, setValidationErrors] = useState(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('salvarPresenca', evento.id), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });

    };
    return (
        <>
            <Head title='Confirmar presença'/>
            <DefaultFormCadastro className="flex flex-col items-center gap-6">
                <h1 className="text-primary text-xl dark:text-white">Confirmar presença em {evento.nome}</h1>
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
                        id="cpf"
                        label="CPF (digite sem pontos e traços): *"
                        placeholder="000.000.000-99"
                        required={true}
                        value={data.cpf}
                        onChange={(e) => {
                            const raw = e.target.value;
                            const formatted = formatCPF(raw);
                            setData('cpf', formatted);
                        }}
                    />

                    <Button type={'submit'} className="mt-4">
                        Confirmar
                    </Button>

                </Form>
            </DefaultFormCadastro>
        </>
    );
}
