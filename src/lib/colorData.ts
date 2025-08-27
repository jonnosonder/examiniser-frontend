
export const defaultColors:string[] = [
  "#000000", "#FFFFFF", "#EE0000", "#980e0e", "#FFC000", "#E97132",
  "#FFFF00", "#35d315", "#196B24", "#47CFFF", "#0B6F97", "#002060",
  "#da24c5", "#5D1955", "#c4c4c4", "#717171", "#863805", "#553735",
];

const colorHistoryAmount = 18;
export const recentColors:(string)[] = Array(colorHistoryAmount).fill('');

export function addHexToRecent (hex: string) {
  if (!recentColors.includes(hex)){
    recentColors.unshift(hex);
    recentColors.length = colorHistoryAmount;
  }
}