<!DOCTYPE html>
<html>
<head>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        body {
            margin: 0;
            padding: 0;
            background-image: url("{{ public_path('storage/' . $imagem_fundo) }}");
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            font-family: sans-serif;
            text-align: center;
        }
        .conteudo {
            position: relative;
            top: 300px; /* seu ajuste */
            max-width: 280mm; /* um pouco menor que A4 deitada */
            margin-left: auto;
            margin-right: auto; /* centraliza horizontalmente */
            padding: 40px;
            font-size: 24px; /* maior que antes */
            font-weight: bold;
            color: #000;
        }
        .local-data {
            margin-top: 40px; /* espaçamento entre texto e data */
            font-size: 18px;
            font-weight: normal;
        }
    </style>
</head>
<body>
<div class="conteudo">
    {!! $conteudo !!}
    <div class="local-data">
        Florianópolis, {{ \Carbon\Carbon::now()->format('d/m/Y') }}
    </div>
</div>
</body>
</html>
