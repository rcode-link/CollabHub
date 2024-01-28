<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\PermissionDefinition;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company = Company::create([
            'name' => 'My company',
            'is_costumer_company' => false
        ]);


        $permissions = PermissionDefinition::all()
            ->map(function ($obj) use ($company) {
                return [
                    'permission' => $obj->slug . '.' . $company->id,
                    'user_id' => 1,
                    'resourceable_id' => $company->id,
                    'resourceable_type' => Company::class,
                ];
            });
    }
}
