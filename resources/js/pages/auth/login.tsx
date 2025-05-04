import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import logoBranco from '../../../../public/images/Corensc_branco.png';
import logoPreto from '../../../../public/images/Corensc_preto.png';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Login" />
            <>
                <div className="flex min-h-screen items-center justify-center bg-[#EBEBEB] dark:bg-[#101524]">
                    <form onSubmit={handleSubmit} className="flex w-[90%] max-w-md flex-col md:w-full">
                        <a href={route('login')} className="mb-12 self-center">
                            <img src={logoPreto} width={120} className="block dark:hidden" />
                            <img src={logoBranco} width={120} className="hidden dark:block" />
                        </a>

                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder="Usuário"
                                label="Usuário"
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                autoComplete="username"
                                className={`${(errors as any).login_error ? 'border-red-700' : 'border-input'} h-12`}
                                required={true}
                            />
                            {errors.username && <p className="mt-1 text-sm text-red-700">{errors.username}</p>}

                            <Input
                                type="password"
                                placeholder="Senha"
                                label="Senha"
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`${(errors as any).login_error ? 'border-red-700' : 'border-input'} h-12`}
                                autoComplete="current-password"
                                required={true}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password}</p>}
                            <Button disabled={processing} type="submit">
                                Entrar
                            </Button>

                            <span className="self-center font-semibold text-blue-900">Utilize o mesmo login do pc!</span>
                        </div>

                        {(errors as any).login_error && <div className="ms-4 mt-4 text-sm text-red-700">{(errors as any).login_error}</div>}
                    </form>
                </div>
            </>
        </>
    );
}
