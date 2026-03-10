import { createContext, useContext } from 'react';
import { GlobalStore } from './globalStore';
import { MissiGStore } from './missiGStore';
import { FileStore } from './fileStore';

export class RootStore {
  globalStore: GlobalStore;
  missigStore: MissiGStore;
  fileStore: FileStore;

  constructor() {
    this.missigStore = new MissiGStore(this);
    this.fileStore = new FileStore(this);
    this.globalStore = new GlobalStore(this);
  }
}

const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);
export const useRootStore = () => useContext(StoreContext);
export { rootStore };
