<?php

return (new PhpCsFixer\Config())
    ->setRules(['@PSR2' => true])
    ->setFinder(PhpCsFixer\Finder::create()->in(__DIR__));

#
# use PhpCsFixer\Config;
# use PhpCsFixer\Finder;
#
# $finder = Finder::create()
#     ->in(__DIR__)
#     ->name('*.php')
#     ->exclude('vendor')
#     ->notName('*.blade.php'); // Ignore Blade templates, if using Laravel
#
# return (new Config())
#     ->setRules([
#         '@PSR12' => true,             // Use PSR-12 coding standards
#         'array_syntax' => ['syntax' => 'short'],
#         'binary_operator_spaces' => ['default' => 'align_single_space'],
#         'blank_line_after_namespace' => true,
#         'blank_line_after_opening_tag' => true,
#         'blank_line_before_statement' => ['statements' => ['return']],
#         'cast_spaces' => ['space' => 'single'],
#         'class_attributes_separation' => ['elements' => ['method' => 'one']],
#         'concat_space' => ['spacing' => 'one'],
#         'declare_equal_normalize' => true,
#         'elseif' => true,
#         'encoding' => true,
#         'full_opening_tag' => true,
#         'function_typehint_space' => true,
#         'indentation_type' => true,
#         'line_ending' => true,
#         'lowercase_cast' => true,
#         'no_trailing_whitespace' => true,
#         'no_whitespace_in_blank_line' => true,
#         'single_blank_line_at_eof' => true,
#     ])
#     ->setFinder($finder);
#
