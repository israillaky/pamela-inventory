<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorPNG;

class BarcodeService
{
    public static function generate(string $code)
    {
        $generator = new BarcodeGeneratorPNG();
        return base64_encode($generator->getBarcode($code, $generator::TYPE_CODE_128));
    }
}
