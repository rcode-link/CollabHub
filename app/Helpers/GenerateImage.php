<?php

namespace App\Helpers;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\Image;
use Intervention\Image\Typography\FontFactory;

class GenerateImage
{
    static string $startColor = '12151D';
    static string $endColor = 'AB4E2D';

    static function profileImage(string $fullName): Image
    {
        $manager = new ImageManager(Driver::class);
        $width = 128;
        $height = 128;


        $image = $manager->create($width, $height);

        // Generate gradient background
        // Define the colors
        $color1 = [0x12, 0x15, 0x1D];
        $color2 = [0xAB, 0x4E, 0x2D];

        // Create a new image
        // Generate gradient background
        for ($i = 0; $i < $width; $i++) {
            for ($j = 0; $j < $height; $j++) {
                // Calculate gradient ratio
                $ratio = ($i + $j) / ($width + $height);
                // Interpolate between the two colors
                $r = (1 - $ratio) * $color1[0] + $ratio * $color2[0];
                $g = (1 - $ratio) * $color1[1] + $ratio * $color2[1];
                $b = (1 - $ratio) * $color1[2] + $ratio * $color2[2];
                $image->drawPixel($i, $j, "rgb($r,$g,$b)");
            }
        }

        // Add slight noise
        for ($i = 0; $i < $width; $i++) {
            for ($j = 0; $j < $height; $j++) {
                $r = rand(-10, 10);
                $g = rand(-10, 10);
                $b = rand(-10, 10);
                $color = $image->pickColor($i, $j);
                $newColor = join(',', [
                    max(0, min(255, $color->red()->value() + $r)),
                    max(0, min(255, $color->green()->value() + $g)),
                    max(0, min(255, $color->blue()->value() + $b))
                ]);

                $image->drawPixel($i, $j, "rgb($newColor)");
            }
        }

        $image->text(collect(\Str::ucsplit($fullName))->map(fn($str) => \Str::charAt($str, 0))->join(''), 64, 64, function (FontFactory $font) {
            $font->filename(storage_path('fonts/OpenSans-VariableFont_wdth.ttf'));
            $font->size(64);
            $font->color('fff');
            $font->valign('middle');
            $font->align('center');
        });

        return $image;
    }
}
