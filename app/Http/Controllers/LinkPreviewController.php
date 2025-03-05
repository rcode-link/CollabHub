<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;
use DOMDocument;
use DOMXPath;

class LinkPreviewController extends Controller
{
    /**
     * Get preview metadata for a URL
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetch(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid URL',
                'errors' => $validator->errors()
            ], 422);
        }

        $url = $request->input('url');

        try {
            // Fetch and parse the content
            $metadata = $this->fetchMetadata($url);

            return response()->json([
                'success' => true,
                'url' => $url,
                'title' => $metadata['title'] ?? '',
                'description' => $metadata['description'] ?? '',
                'image' => $metadata['image'] ?? null,
            ]);
        } catch (Exception $e) {
            Log::error('Link preview error: ' . $e->getMessage(), [
                'url' => $url,
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'url' => $url,
                'message' => 'Failed to fetch link preview',
                'title' => $url,
                'description' => '',
                'image' => null
            ], 200); // Still return 200 for the frontend to handle gracefully
        }
    }

    /**
     * Fetch metadata from the URL
     *
     * @param  string  $url
     * @return array
     */
    protected function fetchMetadata($url)
    {
        // Set a reasonable timeout to prevent long-running requests
        $response = Http::timeout(5)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://yourdomain.com)'
            ])
            ->get($url);

        if (!$response->successful()) {
            throw new Exception('Failed to retrieve content from URL: ' . $response->status());
        }

        $html = $response->body();

        // First try to extract metadata from Open Graph tags and Twitter cards
        $metadata = $this->extractOpenGraphMetadata($html);

        // If not found, fall back to basic HTML tags
        if (empty($metadata['title']) && empty($metadata['description']) && empty($metadata['image'])) {
            $basicMetadata = $this->extractBasicMetadata($html, $url);
            $metadata = array_merge($metadata, $basicMetadata);
        }

        // Clean up data
        $metadata['title'] = $this->cleanText($metadata['title'] ?? '');
        $metadata['description'] = $this->cleanText($metadata['description'] ?? '');

        // Ensure image URL is absolute
        if (!empty($metadata['image']) && !filter_var($metadata['image'], FILTER_VALIDATE_URL)) {
            $metadata['image'] = $this->makeAbsoluteUrl($metadata['image'], $url);
        }

        return $metadata;
    }

    /**
     * Extract metadata from Open Graph tags and Twitter cards
     *
     * @param  string  $html
     * @return array
     */
    protected function extractOpenGraphMetadata($html)
    {
        $metadata = [
            'title' => '',
            'description' => '',
            'image' => null
        ];

        // Extract using regex for better performance than loading full DOM
        // Open Graph title
        preg_match('/<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
        if (!empty($matches[1])) {
            $metadata['title'] = $matches[1];
        }

        // Twitter title (fallback)
        if (empty($metadata['title'])) {
            preg_match('/<meta[^>]*name=["\']twitter:title["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
            if (!empty($matches[1])) {
                $metadata['title'] = $matches[1];
            }
        }

        // Open Graph description
        preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
        if (!empty($matches[1])) {
            $metadata['description'] = $matches[1];
        }

        // Twitter description (fallback)
        if (empty($metadata['description'])) {
            preg_match('/<meta[^>]*name=["\']twitter:description["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
            if (!empty($matches[1])) {
                $metadata['description'] = $matches[1];
            }
        }

        // Open Graph image
        preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
        if (!empty($matches[1])) {
            $metadata['image'] = $matches[1];
        }

        // Twitter image (fallback)
        if (empty($metadata['image'])) {
            preg_match('/<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\'](.*?)["\'][^>]*>/i', $html, $matches);
            if (!empty($matches[1])) {
                $metadata['image'] = $matches[1];
            }
        }

        return $metadata;
    }

    /**
     * Extract basic metadata from HTML tags as a fallback
     *
     * @param  string  $html
     * @param  string  $url
     * @return array
     */
    protected function extractBasicMetadata($html, $url)
    {
        $metadata = [
            'title' => '',
            'description' => '',
            'image' => null
        ];

        // Use DOMDocument for more accurate parsing
        $doc = new DOMDocument();

        // Suppress errors from malformed HTML
        libxml_use_internal_errors(true);
        $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        libxml_clear_errors();

        $xpath = new DOMXPath($doc);

        // Get title
        $titleNode = $xpath->query('//title');
        if ($titleNode && $titleNode->length > 0) {
            $metadata['title'] = $titleNode->item(0)->textContent;
        }

        // Get meta description
        $metaDesc = $xpath->query('//meta[@name="description"]/@content');
        if ($metaDesc && $metaDesc->length > 0) {
            $metadata['description'] = $metaDesc->item(0)->textContent;
        }

        // If no description, try to get the first paragraph
        if (empty($metadata['description'])) {
            $paragraphs = $xpath->query('//p');
            if ($paragraphs && $paragraphs->length > 0) {
                foreach ($paragraphs as $p) {
                    $text = trim($p->textContent);
                    if (strlen($text) > 50) { // Only use substantial paragraphs
                        $metadata['description'] = $text;
                        break;
                    }
                }
            }
        }

        // Try to find an image
        $images = $xpath->query('//img[@src]');
        if ($images && $images->length > 0) {
            // Find the largest image that's likely to be content (skip small icons)
            $largestImage = null;
            $largestArea = 0;

            foreach ($images as $img) {
                $src = $img->getAttribute('src');
                $width = (int) $img->getAttribute('width');
                $height = (int) $img->getAttribute('height');

                // Skip tiny images, likely to be icons
                if (($width > 0 && $height > 0) && ($width * $height > $largestArea) && ($width >= 100 && $height >= 100)) {
                    $largestArea = $width * $height;
                    $largestImage = $src;
                } elseif (!$largestImage && strpos(strtolower($src), 'logo') === false) {
                    // Fallback to first non-logo image if we can't determine size
                    $largestImage = $src;
                }
            }

            if ($largestImage) {
                $metadata['image'] = $largestImage;
            }
        }

        return $metadata;
    }

    /**
     * Clean text by trimming, decoding HTML entities, and limiting length
     *
     * @param  string  $text
     * @return string
     */
    protected function cleanText($text)
    {
        $text = trim($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text); // Remove extra whitespace
        return $text;
    }

    /**
     * Convert relative URL to absolute
     *
     * @param  string  $relativeUrl
     * @param  string  $baseUrl
     * @return string
     */
    protected function makeAbsoluteUrl($relativeUrl, $baseUrl)
    {
        // If it's a protocol-relative URL (starts with //)
        if (substr($relativeUrl, 0, 2) === '//') {
            return parse_url($baseUrl, PHP_URL_SCHEME) . ':' . $relativeUrl;
        }

        // If it's already absolute
        if (filter_var($relativeUrl, FILTER_VALIDATE_URL)) {
            return $relativeUrl;
        }

        // Parse base URL
        $parsedUrl = parse_url($baseUrl);
        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : 'https://';
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';

        // Remove filename from path if it exists
        $path = preg_replace('/\/[^\/]*$/', '/', $path);

        // Handle different types of relative URLs
        if (substr($relativeUrl, 0, 1) === '/') {
            // Absolute path
            return $scheme . $host . $relativeUrl;
        } else {
            // Relative path
            return $scheme . $host . $path . $relativeUrl;
        }
    }
}
