import { jsPDF } from "jspdf";

// Extend jsPDF interface to avoid 'any'
declare module "jspdf" {
    interface jsPDF {
        getFontList(): Record<string, string[]>;
        addFileToVFS(filename: string, content: string): void;
        addFont(filename: string, fontName: string, fontStyle: string): void;
    }
}

export function ensureFontRegistered(
    doc: jsPDF,
    fontFileName: string,
    fontName: string,
    fontStyle: string,
    base64Data: string
): void {
    const fontList = doc.getFontList();

    // Check if font family exists AND has this style
    if (fontList[fontName] && fontList[fontName].includes(fontStyle)) {
        console.log(`✅ Font '${fontName}' (${fontStyle}) already registered.`);
        return; // Already registered — skip
    }

    //console.log(`➕ Registering font '${fontName}' (${fontStyle})...`);

    // Add to Virtual File System
    doc.addFileToVFS(fontFileName, base64Data);

    // Register the font
    doc.addFont(fontFileName, fontName, fontStyle);
}