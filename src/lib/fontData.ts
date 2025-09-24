// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

export const fontNamesArray: string[] = [
    'Bitter',
    'Cormorant-Garamond',
    "IBM-Plex-Mono",
    "IBM-Plex-Sans",
    "IBM-Plex-Serif",
    "Inter",
    "Lora",
    "Merriweather",
    "Montserrat",
    "Noto-Sans",
    "Noto-Serif",
    "PT-Sans",
    "PT-Serif",
    "Roboto",
    "Slabo",
    "STIX-Two-Text",
];

export const fontFileArray: string[] = [
    "Bitter[wght].ttf",
    "CormorantGaramond[wght].ttf",
    "IBMPlexMono-Regular.ttf",
    "IBMPlexSans[wdth,wght].ttf",
    "IBMPlexSerif-Regular.ttf",
    "Inter[opsz,wght].ttf",
    "Lora[wght].ttf",
    "Merriweather[opsz,wdth,wght].ttf",
    "Montserrat[wght].ttf",
    "NotoSansYi-Regular.ttf",
    "NotoSerif[wdth,wght].ttf",
    "PT_Sans-Web-Regular.ttf",
    "PT_Serif-Web-Regular.ttf",
    "Roboto[wdth,wght].ttf",
    "Slabo27px-Regular.ttf",
    "STIXTwoText[wght].ttf"
]

export function getFontNamesArray(): string[] {
    return fontNamesArray;
}

export const fontsUsage: { [key: string]: number } = {
    'Bitter': 0,
    'Cormorant-Garamond': 0,
    "IBM-Plex-Mono": 0,
    "IBM-Plex-Sans": 0,
    "IBM-Plex-Serif": 0,
    "Inter": 0,
    "Lora": 0,
    "Merriweather": 0,
    "Montserrat": 0,
    "Noto-Sans": 0,
    "Noto-Serif": 0,
    "PT-Sans": 0,
    "PT-Serif": 0,
    "Roboto": 0,
    "Slabo": 0,
    "STIX-Two-Text": 0,
};

export function increaseFontInUse(fontName:string) {
    fontsUsage[fontName] += 1;
}

export function decreaseFontInUse(fontName:string) {
    fontsUsage[fontName] -= 1;
}