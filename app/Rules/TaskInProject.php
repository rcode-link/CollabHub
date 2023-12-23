<?php

namespace App\Rules;

use App\Models\Task;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TaskInProject implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $task = Task::whereId($value)
            ->where('project_id', request()->get('project_id', null))
            ->exists();
        if (!$task) {
            $fail("The {$attribute} is invalid.");
        }
    }
}
