import { makeAutoObservable } from "mobx";

import { RootStore } from "./rootstore.ts";

export class GlobalStore {
  root: RootStore;
  REMOVEME_TEMP: number = 0;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  IncrementTemp = (): void => {
    this.REMOVEME_TEMP++;
  };

  DecrementTemp = (): void => {
    this.REMOVEME_TEMP--;
  };
}
