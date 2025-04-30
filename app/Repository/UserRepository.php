<?php

namespace App\Repository;

use App\Repository\Inteface\UserRepositoryInterface;
use App\Models\User;
class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::findById($id);
    }
    
    public function findOneBy(array $criteria): ?User
    {
        return User::where($criteria)->first();
    }

    public function findBy(array $criteria): array
    {
        return User::where($criteria)->get()->all();
    }

    public function findAll(): array
    {
        return User::all()->all();
    }
}