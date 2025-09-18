// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { fontFileArray, fontNamesArray } from "@/lib/fontData";
import { jsPDF } from "jspdf";

export async function registerAllFont(doc: jsPDF) {
    for (let i = 0; i < fontNamesArray.length; i++) {
        const base64Font = await loadFontAsBase64('/fonts/text/'+fontFileArray[i]);
        const rawBase64 = base64Font.replace(/^data:.*;base64,/, '');
        doc.addFileToVFS(fontFileArray[i], rawBase64);
        doc.addFont(fontFileArray[i], fontNamesArray[i], 'normal');
    }
}

async function loadFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);

  const arrayBuffer = await response.arrayBuffer();
  return `data:font/ttf;base64,${arrayBufferToBase64(arrayBuffer)}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}