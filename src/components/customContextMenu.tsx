// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function CustomContextMenu({
  x,
  y,
  show,
  onClose,
  onSelect,
}: {
  x: number;
  y: number;
  show: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}) {
  const { t } = useTranslation();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bg-white shadow-lg rounded-md p-2 z-50"
      style={{ top: y, left: x }}
    >
      <div
        onClick={() => {
          onSelect('copy');
          onClose();
        }}
        className="hover:bg-gray-100 p-2 cursor-pointer"
      >
        {t("context-menu.copy")}
      </div>
      <div
        onClick={() => {
          onSelect('cut');
          onClose();
        }}
        className="hover:bg-gray-100 p-2 cursor-pointer"
      >
        {t("context-menu.cut")}
      </div>
      <div
        onClick={() => {
          onSelect('paste');
          onClose();
        }}
        className="hover:bg-gray-100 p-2 cursor-pointer"
      >
        {t("context-menu.paste")}
      </div>
      <div
        onClick={() => {
          onSelect('delete');
          onClose();
        }}
        className="hover:bg-red p-2 cursor-pointer"
      >
        {t("editor.delete")}
      </div>
    </div>
  );
}
