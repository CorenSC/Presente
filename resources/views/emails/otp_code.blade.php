@extends('emails.base')

@section('content')
    <h1>Olá!</h1>

    <p>Seu código de acesso para o evento é:</p>

    <div class="otp-boxes">
        @foreach(str_split($otp) as $digit)
            <div class="otp-box">{{ $digit }}</div>
        @endforeach
    </div>

    <p>Por favor, insira o código para continuar o login.</p>

    <p>Obrigado,<br>{{ config('app.name') }}</p>
@endsection
