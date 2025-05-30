<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px 40px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.04);
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            margin-top: 30px;
        }

        .img-center {
            display: block;
            margin: 0 auto 20px auto;
            max-width: 160px;
        }
    </style>
</head>
<body>
<div class="container">
    <img src="{{ asset('images/Corensc_preto.png') }}" alt="Logo Coren-SC" class="img-center">

    @yield('content')
</div>

<div class="footer">
    <p>Este é um e-mail automático enviado pelo sistema do Coren-SC. Por favor, não responda.</p>
    <p>&copy; {{ date('Y') }} Coren-SC. Todos os direitos reservados.</p>
</div>
</body>
</html>
