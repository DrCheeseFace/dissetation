import { makeAutoObservable } from "mobx";

import { RootStore } from "@/mobx/rootstore.ts";
import type { BasicInfo, UUID } from "@/model/BasicInfo";
import { getSample } from "@/utils/routes";

export class ComparisonStore {
  root: RootStore;
  parentFile?: BasicInfo;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  fetchSample = async (uuid: UUID, count: number): Promise<any> => {
    const response = await fetch(getSample(uuid, count), {
      method: "GET",
    });
    return response.json();
  };

}
