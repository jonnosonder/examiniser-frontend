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