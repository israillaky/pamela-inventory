<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorPNG;

class ProductService
{
    public static function barcodePng(string $barcode)
    {
        $gen = new BarcodeGeneratorPNG();
        return 'data:image/png;base64,' .
            base64_encode(
                $gen->getBarcode($barcode, $gen::TYPE_CODE_128, 2, 60)
            );
    }
}
