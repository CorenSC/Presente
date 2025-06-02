# Presente

Este é um projeto utilizando [Laravel](https://laravel.com/), [Inertia.js](https://inertiajs.com/) e [React](https://reactjs.org/).  
---

## ✅ Requisitos

Antes de começar, certifique-se de ter instalado:

- [PHP 8.1+](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Node.js (v18 ou superior)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Banco de dados (MariaDB)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/CorenSC/Presente.git
cd Presente
```
### 2. Instale as dependências PHP

```bash
composer install
```
### 3. Instale as dependências JavaScript
```bash
npm intall
#ou
yarn install
```
### 4. copie o .env.example para .env e modifique com as necessidades
```bash
cp .env.example .env
```
### 6. Configure o banco de dados
Edite o arquivo .env com suas credenciais de banco de dados:
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nome_do_banco
DB_USERNAME=usuario
DB_PASSWORD=senha
```
### 7. Rode as migrations
```bash
php artisan migrate
```
## 🧪 Rodando o ambiente de desenvolvimento
Execute o seguinte comando:
```bash
composer run dev
```
Esse comando executa os seguintes serviços simultaneamente:

- Inicia o servidor Laravel
- Inicia o Vite (React)
- Escuta as filas (`queue:listen`)
- Roda o Pail (`artisan pail`)
