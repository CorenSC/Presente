import Form from '@/components/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { formatarDataBrasileira, formatCPF, formatTelefone } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

type Atividade = {
    nome: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
};

interface Evento {
    id: number;
    nome: string;
    local_do_evento: string;
    data_inicio: string;
    data_fim: string;
    hora_inicio: string;
    hora_fim: string;
    descricao: string;
    atividades: Atividade[];
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
        instituicao: '',
        numero_inscricao: '',
        municipio: '',
        evento_id: evento.id,
    });

    const [validationErrors, setValidationErrors] = useState(null);
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const result = await response.json();

                            const municipio = result.address.city || result.address.town || result.address.village;

                            // Aqui você cria uma cópia dos dados atuais e adiciona o município manualmente
                            const formDataWithMunicipio = {
                                ...data,
                                municipio,
                            };

                            // Agora envia o formulário com o município incluso
                            router.post(route('participanteStore'), formDataWithMunicipio, {
                                onError: (errors) => {
                                    // @ts-ignore
                                    setValidationErrors(errors);
                                },
                            });

                        } catch (error) {
                            // @ts-ignore
                            setValidationErrors({ general: 'Erro ao obter dados de geolocalização. Tente novamente.' });
                        }
                    },
                    (error) => {
                        // @ts-ignore
                        setValidationErrors({ geolocation: 'Erro ao obter a localização do usuário.' });
                    }
                );
            } else {
                // @ts-ignore
                setValidationErrors({ geolocation: 'Geolocalização não disponível no seu navegador.' });
            }
        } catch (error) {
            // @ts-ignore
            setValidationErrors({ general: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' });
        }
    };

    return (
        <>
            <Head title="Formulário de cadastro" />
            <DefaultFormCadastro className="">
                <div className="flex flex-col items-center gap-6">
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
                    <div className="w-full rounded-md bg-white p-6 shadow-md dark:bg-gray-800 lg:w-1/2">
                        <h1 className="text-primary mb-2 text-lg font-bold dark:text-white">
                            Evento: <span>{evento.nome}</span>
                        </h1>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">Descrição: {evento.descricao}</p>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-4">
                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl shadow-sm">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-primary text-sm dark:text-white">Local:</p>
                                    <p className="text-primary text-base font-medium dark:text-white">{evento.local_do_evento}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl shadow-sm">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-primary text-sm dark:text-white">Período:</p>
                                    <p className="text-primary text-base font-medium dark:text-white">
                                        {formatarDataBrasileira(evento.data_inicio)} - {formatarDataBrasileira(evento.data_fim)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl shadow-sm">
                                    <FaClock />
                                </div>
                                <div>
                                    <p className="text-primary text-sm dark:text-white">Horário:</p>
                                    <p className="text-primary text-base font-medium dark:text-white">
                                        {evento.hora_inicio.slice(0, 5)} - {evento.hora_fim.slice(0, 5)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {evento.atividades && evento.atividades.length > 0 && (
                            <div className="border-t pt-4 dark:border-gray-700">
                                <h2 className="text-primary mb-4 text-lg font-semibold dark:text-white">Atividades</h2>
                                <div className="space-y-4">
                                    {evento.atividades.map((atividade, index) => (
                                        <div key={index} className="rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                            <p className="text-primary text-base font-medium dark:text-white">{atividade.nome}</p>
                                            <p className="text-sm text-gray-500">
                                                Data:{' '}
                                                <span className="text-gray-800 dark:text-gray-300">{formatarDataBrasileira(atividade.data)}</span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Horário:{' '}
                                                <span className="text-gray-800 dark:text-gray-300">
                                                    {atividade.hora_inicio.slice(0, 5)} - {atividade.hora_fim.slice(0, 5)}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
                        <div className="flex flex-col items-center justify-around gap-4 lg:flex-row">
                            <Input
                                type="email"
                                id="email"
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
                                Categoria: *
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
                                label="Número de inscrição no Coren:"
                                placeholder="000000"
                                required={false}
                                value={data.numero_inscricao}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                                    setData('numero_inscricao', onlyNumbers);
                                }}
                                classNameForLabel="w-full lg:w-1/2"
                            />
                        </div>
                        <Input
                            type="text"
                            id="instituicao"
                            label="Instituição:"
                            placeholder="Instituição"
                            required={false}
                            value={data.instituicao}
                            onChange={(e) => setData('instituicao', e.target.value)}
                        />

                        <p className="text-sm text-red-600">Os campos com * são obrigatórios</p>
                        <Button type={'submit'} className="mt-4">
                            Cadastrar-se
                        </Button>
                    </Form>
                </div>
            </DefaultFormCadastro>
        </>
    );
}

const categorias = ['Auxiliar de enfermagem', 'Enfermeiro', 'Técnico de enfermagem', 'Obstetriz', 'Estudante', 'Outros'];

function renderOpcoesCategoria() {
    return categorias.map((categoria) => (
        <SelectItem key={categoria} value={categoria}>
            {categoria}
        </SelectItem>
    ));
}
