// resources/js/Pages/Auth/Login.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import logoPreto  from '../../../../public/images/Corensc_preto.png'
import logoBranco  from '../../../../public/images/Corensc_branco.png'

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
        <div className="flex min-h-screen items-center justify-center bg-[#EBEBEB] dark:bg-[#101524] ">
            <form onSubmit={handleSubmit} className="w-[90%] md:w-full max-w-md flex flex-col">
                <a href={route('login')} className='self-center mb-12'>
                    <img src={logoPreto} width={120} className='block dark:hidden'/>
                    <img src={logoBranco} width={120} className='hidden dark:block'/>
                </a>

                <div className="flex flex-col gap-4">
                    <Input
                        placeholder='Usuário'
                        label='Usuário'
                        id='username'
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        autoComplete="username"
                        className={`${(errors as any).login_error ? 'border-red-700' : 'border-input'} h-12`}
                        required={true}
                    />
                    {errors.username && <p className="text-red-700 text-sm mt-1">{errors.username}</p>}

                    <Input
                        type='password'
                        placeholder='Senha'
                        label='Senha'
                        id='password'
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={`${(errors as any).login_error ? 'border-red-700' : 'border-input'} h-12`}
                        autoComplete='current-password'
                        required={true}
                    />
                    {errors.password && <p className="text-red-700 text-sm mt-1">{errors.password}</p>}
                    <Button
                        disabled={processing}
                        type='submit'
                    >
                        Entrar
                    </Button>

                    <span className='self-center font-semibold text-blue-900'>Utilize o mesmo login do pc!</span>
                </div>

                    {(errors as any).login_error && (
                        <div className="text-red-700 text-sm mt-4 ms-4">{(errors as any).login_error}</div>
                    )}
            </form>
        </div>
    );
}
