// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import {
  createContext,
  useContext,
  useRef,
  ReactNode,
  RefObject,
} from 'react';

type SelectIndexType = {
  pageIndex: number | null;
  groupIndex: number | null;
};

interface SelectContextType {
  selectIndex: RefObject<SelectIndexType>;
  setSelectIndex: (value: Partial<SelectIndexType>) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

export const EditorContextProvider = ({ children }: { children: ReactNode }) => {
  const selectIndex = useRef<SelectIndexType>({
    pageIndex: null,
    groupIndex: null,
  });

  const setSelectIndex = (value: Partial<SelectIndexType>) => {
    if (selectIndex.current) {
      Object.assign(selectIndex.current, value);

      // Dispatch a custom event when value changes
      const event = new CustomEvent('selectIndexChanged');
      window.dispatchEvent(event);
    }
  };

  return (
    <SelectContext.Provider value={{ selectIndex, setSelectIndex }}>
      {children}
    </SelectContext.Provider>
  );
};

export const useSelectRef = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectRef must be used within EditorContextProvider');
  }
  return context;
};
