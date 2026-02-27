<?php

namespace App\Service;

use Symfony\Component\Emoji\EmojiTransliterator;

class SlackMrkdwnConverter
{
    private ?EmojiTransliterator $emojiTransliterator = null;

    /**
     * Build a TipTap doc from Slack-format payload.
     * Accepts either raw mrkdwn text, or structured blocks from attachments.
     */
    public function convertPayload(array $payload): array
    {
        $paragraphs = [];

        // Extract blocks from attachments (Uptime Kuma rich messages)
        $blocks = $this->extractBlocks($payload);

        if (! empty($blocks)) {
            $paragraphs = $this->convertBlocks($blocks);
        }

        // Fall back to plain text field
        if (empty($paragraphs) && ! empty($payload['text'])) {
            return $this->convert($payload['text']);
        }

        return ['type' => 'doc', 'content' => $paragraphs ?: [['type' => 'paragraph']]];
    }

    /**
     * Convert a plain mrkdwn string to TipTap JSON doc.
     */
    public function convert(string $slackText): array
    {
        $slackText = $this->replaceEmojis($slackText);
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

    /**
     * Extract blocks from Slack attachments or top-level blocks.
     */
    private function extractBlocks(array $payload): array
    {
        // Top-level blocks
        if (! empty($payload['blocks'])) {
            return $payload['blocks'];
        }

        // Blocks inside attachments (Uptime Kuma style)
        if (! empty($payload['attachments'])) {
            $blocks = [];
            foreach ($payload['attachments'] as $attachment) {
                if (! empty($attachment['blocks'])) {
                    array_push($blocks, ...$attachment['blocks']);
                }
                // Simple attachment fallback text
                if (empty($attachment['blocks']) && ! empty($attachment['text'])) {
                    $blocks[] = ['type' => 'section', 'text' => ['type' => 'mrkdwn', 'text' => $attachment['text']]];
                }
            }

            return $blocks;
        }

        return [];
    }

    /**
     * Convert Slack Block Kit blocks to TipTap paragraphs.
     */
    private function convertBlocks(array $blocks): array
    {
        $paragraphs = [];

        foreach ($blocks as $block) {
            switch ($block['type'] ?? '') {
                case 'header':
                    $text = $block['text']['text'] ?? '';
                    $text = $this->replaceEmojis($text);
                    $paragraphs[] = [
                        'type' => 'heading',
                        'attrs' => ['level' => 3],
                        'content' => [['type' => 'text', 'text' => $text, 'marks' => [['type' => 'bold']]]],
                    ];
                    break;

                case 'section':
                    // Section with fields (e.g. Uptime Kuma Message + Time)
                    if (! empty($block['fields'])) {
                        foreach ($block['fields'] as $field) {
                            $mrkdwn = $field['text'] ?? '';
                            $mrkdwn = $this->replaceEmojis($mrkdwn);
                            $lines = explode("\n", $mrkdwn);
                            foreach ($lines as $line) {
                                if ($line === '') {
                                    continue;
                                }
                                $paragraphs[] = [
                                    'type' => 'paragraph',
                                    'content' => $this->parseInline($line),
                                ];
                            }
                        }
                    }
                    // Section with single text
                    if (! empty($block['text']['text'])) {
                        $mrkdwn = $this->replaceEmojis($block['text']['text']);
                        $lines = explode("\n", $mrkdwn);
                        foreach ($lines as $line) {
                            if ($line === '') {
                                continue;
                            }
                            $paragraphs[] = [
                                'type' => 'paragraph',
                                'content' => $this->parseInline($line),
                            ];
                        }
                    }
                    break;

                case 'context':
                    if (! empty($block['elements'])) {
                        foreach ($block['elements'] as $el) {
                            $text = $el['text'] ?? '';
                            $text = $this->replaceEmojis($text);
                            $paragraphs[] = [
                                'type' => 'paragraph',
                                'content' => $this->parseInline($text),
                            ];
                        }
                    }
                    break;

                case 'actions':
                    // Convert action buttons to links
                    foreach ($block['elements'] ?? [] as $el) {
                        if (($el['type'] ?? '') === 'button' && ! empty($el['url'])) {
                            $label = $el['text']['text'] ?? $el['url'];
                            $paragraphs[] = [
                                'type' => 'paragraph',
                                'content' => [[
                                    'type' => 'text',
                                    'text' => $label,
                                    'marks' => [['type' => 'link', 'attrs' => ['href' => (string) $el['url'], 'target' => '_blank']]],
                                ]],
                            ];
                        }
                    }
                    break;

                case 'divider':
                    $paragraphs[] = ['type' => 'horizontalRule'];
                    break;
            }
        }

        return $paragraphs;
    }

    private function replaceEmojis(string $text): string
    {
        if ($this->emojiTransliterator === null) {
            $this->emojiTransliterator = EmojiTransliterator::create('slack', true);
        }

        return $this->emojiTransliterator->transliterate($text);
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
