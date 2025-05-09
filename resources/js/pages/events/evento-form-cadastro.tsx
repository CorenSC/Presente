import Form from '@/components/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { formatCPF, formatTelefone } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface Evento {
    id: number;
    nome: string;
    local_do_evento: string;
    data_inicio: string;
    data_fim: string;
    hora_inicio: string;
    hora_fim: string;
}

interface EventoProps {
    evento: Evento;
}

export default function EventoFormCadastro({ evento }: EventoProps) {
    const { data, setData, post } = useForm({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        categoria_profissional: '',
        numero_inscricao: '',
    });

    const [validationErrors, setValidationErrors] = useState(null);
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route(''), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });
    };
    return (
        <>
            <Head title="Formulário de cadastro" />
            <DefaultFormCadastro className="">
                <div className="flex flex-col items-center gap-6">
                    <h1 className="text-primary mt-12 text-base font-bold dark:text-white lg:text-xl">Evento: {evento.nome}</h1>
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
                            label="Nome completo: *"
                            placeholder="Nome completo"
                            required={true}
                            value={data.nome}
                            onChange={(e) => setData('nome', e.target.value)}
                        />
                        <Input
                            type="text"
                            id="cdf"
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
                        <div className="flex flex-col items-center justify-around gap-4 lg:flex-row">
                            <Input
                                type="email"
                                id="nome"
                                label="E-mail: *"
                                placeholder="seuemail@email.com"
                                required={true}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                classNameForLabel="w-full lg:w-1/2"
                            />
                            <Input
                                type="text"
                                id="telefone"
                                label="Número do celular: *"
                                placeholder="(99) 00000-0000"
                                required={true}
                                value={data.telefone}
                                onChange={(e) => setData('telefone', formatTelefone(e.target.value))}
                                classNameForLabel="w-full lg:w-1/2"
                            />
                        </div>
                        <div className="flex flex-col items-center justify-around gap-4 lg:flex-row">
                            <label className="text-primary flex w-full flex-col gap-2 text-sm lg:w-1/2 dark:text-white">
                                Categoria profissional: *
                                <Select value={data.categoria_profissional} onValueChange={(value) => setData('categoria_profissional', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="--Selecione--" />
                                    </SelectTrigger>
                                    <SelectContent>{renderOpcoesCategoria()}</SelectContent>
                                </Select>
                            </label>
                            <Input
                                type="text"
                                id="numero_inscricao"
                                label="Número de inscrição no Coren: *"
                                placeholder="000000"
                                required={true}
                                value={data.numero_inscricao}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                                    setData('numero_inscricao', onlyNumbers);
                                }}
                                classNameForLabel="w-full lg:w-1/2"
                            />
                        </div>
                        <Button type={'submit'} className='mt-4'> Cadastrar-se</Button>
                    </Form>
                </div>
            </DefaultFormCadastro>
        </>
    );
}

const categoriasProfissionais = ['Auxiliar de enfermagem', 'Enfermeiro', 'Técnico de enfermagem', 'Obstetriz'];

function renderOpcoesCategoria() {
    return categoriasProfissionais.map((categoria) => (
        <SelectItem key={categoria} value={categoria}>
            {categoria}
        </SelectItem>
    ));
}
