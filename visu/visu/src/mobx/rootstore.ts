import { createContext, useContext } from 'react';

import { GlobalStore } from '@/mobx/globalStore';
import { MissiGStore } from '@/mobx/missiGStore';
import { FileStore } from '@/mobx/fileStore';
import { ComparisonStore } from '@/mobx/comparisonStore';

export class RootStore {
  globalStore: GlobalStore;
  missigStore: MissiGStore;
  fileStore: FileStore;
  comparisonStore: ComparisonStore;

  constructor() {
    this.comparisonStore = new ComparisonStore(this);
    this.missigStore = new MissiGStore(this);
    this.fileStore = new FileStore(this);
    this.globalStore = new GlobalStore(this);
  }
}

const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);
export const useRootStore = () => useContext(StoreContext);
export { rootStore };
