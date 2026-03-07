import { createContext, useContext } from 'react';
import { GlobalStore } from './globalStore';
import { DashboardStore } from './dashboardStore';

export class RootStore {
  globalStore: GlobalStore;
  dashboardStore: DashboardStore;

  constructor() {
    this.dashboardStore = new DashboardStore(this);
    this.globalStore = new GlobalStore(this);
  }
}

const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);
export const useRootStore = () => useContext(StoreContext);
export { rootStore };
