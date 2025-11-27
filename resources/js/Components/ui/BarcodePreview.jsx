import React from "react";
import html2canvas from "html2canvas";
import Button from "./Button";

export default function BarcodePreview({ png, code, name }) {
  if (!png) return null;

  const downloadLabel = async () => {
    const el = document.getElementById("barcode-label-area");
    if (!el) return;

    // capture the label DOM into canvas
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff", // keep white label
      scale: 3,                   // sharper output
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL("image/png");

    // filename: ProductName-SKU(or barcode).png
    const safeName = (name || "product")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const fileName = `${safeName}-${code}.png`;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="rounded-xl border border-gpt-300 p-4 dark:border-gpt-700 bg-white ">

      {/* THIS is the label we will download */}
      <div
        id="barcode-label-area"
        className="p-3 bg-white text-black rounded-md w-fit mx-auto"
      >
        {/* Product name above */}
        {name && (
          <div className="text-center text-lg font-semibold mb-2">
            {name}
          </div>
        )}

        {/* Barcode image */}
        <div className="flex justify-center">
          <img src={png} alt="barcode" className="h-16 object-contain" />
        </div>

        {/* Code number below */}
        {code && (
          <div className="text-center text-xs mt-2 tracking-wider">
            {code}
          </div>
        )}
      </div>

      {/* Download button */}
      <div className="mt-4 flex justify-center">
        <Button variant="primary" type="button" onClick={downloadLabel}>
          Download Barcode
        </Button>
      </div>
    </div>
  );
}
