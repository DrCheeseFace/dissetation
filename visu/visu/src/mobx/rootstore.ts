import { createContext, useContext } from 'react'
import { GlobalStore } from './globalStore'

export class RootStore {
  globalStore: GlobalStore

  constructor() {
    this.globalStore= new GlobalStore(this)
  }
}

const rootStore = new RootStore()
export const StoreContext = createContext(rootStore)
export const useRootStore = () => useContext(StoreContext)
export { rootStore }

