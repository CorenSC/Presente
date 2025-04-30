<?php

namespace App\Repository\Inteface;

use App\Models\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findOneBy(array $criteria): ?User;
    public function findBy(array $criteria): array;
    public function findAll(): array;
}