<?php

namespace App\Service;

class SlackMrkdwnConverter
{
    public function convert(string $slackText): array
    {
        $lines = explode("\n", $slackText);
        $paragraphs = [];
        $inCodeBlock = false;
        $codeBlockContent = '';

        foreach ($lines as $line) {
            if (! $inCodeBlock && preg_match('/^```/', $line)) {
                $inCodeBlock = true;
                $codeBlockContent = preg_replace('/^```/', '', $line);

                continue;
            }

            if ($inCodeBlock) {
                if (preg_match('/```$/', $line)) {
                    $codeBlockContent .= ($codeBlockContent ? "\n" : '').preg_replace('/```$/', '', $line);
                    $paragraphs[] = [
                        'type' => 'codeBlock',
                        'content' => [
                            ['type' => 'text', 'text' => $codeBlockContent],
                        ],
                    ];
                    $inCodeBlock = false;
                    $codeBlockContent = '';
                } else {
                    $codeBlockContent .= ($codeBlockContent ? "\n" : '').$line;
                }

                continue;
            }

            if ($line === '') {
                $paragraphs[] = ['type' => 'paragraph'];

                continue;
            }

            $paragraphs[] = [
                'type' => 'paragraph',
                'content' => $this->parseInline($line),
            ];
        }

        if ($inCodeBlock) {
            $paragraphs[] = [
                'type' => 'codeBlock',
                'content' => [
                    ['type' => 'text', 'text' => $codeBlockContent],
                ],
            ];
        }

        return ['type' => 'doc', 'content' => $paragraphs ?: [['type' => 'paragraph']]];
    }

    private function parseInline(string $text): array
    {
        $nodes = [];
        $pattern = '/
            `([^`]+)`                          # inline code
            |<(https?:\/\/[^|>]+)\|([^>]+)>    # link with label
            |<(https?:\/\/[^>]+)>              # link without label
            |\*([^*]+)\*                        # bold
            |_([^_]+)_                          # italic
            |~([^~]+)~                          # strike
        /x';

        $offset = 0;
        while (preg_match($pattern, $text, $match, PREG_OFFSET_CAPTURE, $offset)) {
            $matchStart = $match[0][1];

            if ($matchStart > $offset) {
                $nodes[] = ['type' => 'text', 'text' => substr($text, $offset, $matchStart - $offset)];
            }

            if ($match[1][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[1][0],
                    'marks' => [['type' => 'code']],
                ];
            } elseif ($match[2][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[3][0],
                    'marks' => [['type' => 'link', 'attrs' => ['href' => $match[2][0], 'target' => '_blank']]],
                ];
            } elseif ($match[4][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[4][0],
                    'marks' => [['type' => 'link', 'attrs' => ['href' => $match[4][0], 'target' => '_blank']]],
                ];
            } elseif ($match[5][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[5][0],
                    'marks' => [['type' => 'bold']],
                ];
            } elseif ($match[6][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[6][0],
                    'marks' => [['type' => 'italic']],
                ];
            } elseif ($match[7][1] !== -1) {
                $nodes[] = [
                    'type' => 'text',
                    'text' => $match[7][0],
                    'marks' => [['type' => 'strike']],
                ];
            }

            $offset = $matchStart + strlen($match[0][0]);
        }

        if ($offset < strlen($text)) {
            $nodes[] = ['type' => 'text', 'text' => substr($text, $offset)];
        }

        return $nodes ?: [['type' => 'text', 'text' => $text]];
    }
}
