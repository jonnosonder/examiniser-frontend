// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { create } from 'zustand';

type FileStore = {
  file: File | null;
  setFile: (file: File) => void;
  clearFile: () => void;
};

export const useFileStore = create<FileStore>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
  clearFile: () => set({ file: null }),
}));