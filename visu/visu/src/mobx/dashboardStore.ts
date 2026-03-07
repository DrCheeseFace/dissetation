import { makeAutoObservable } from "mobx";

import { RootStore } from "@/mobx/rootstore.ts";
import type {
  BasicInfoAPIResponse,
  DatasetSummary,
} from "@/model/DashboardInfo";
import { getParentFileInfo } from "@/utils/routes";

export class DashboardStore {
  root: RootStore;
  basicInfo?: DatasetSummary; // TODO make persist

  constructor(root: RootStore) {
    this.root = root;
    // makePersistable(this, {
    //   name: "DashboardStore",
    //   properties: ["basicInfo"],
    //   storage: window.localStorage,
    // });
    makeAutoObservable(this);
  }

  setBasicInfo = (info: DatasetSummary) => {
    this.basicInfo = info;
    console.log(JSON.stringify(this.basicInfo));
  };

  fetchParentFileInfo = async () => {
    try {
      const response = await fetch(getParentFileInfo, {
        method: "GET",
      });

      if (response.ok) {
        const result: BasicInfoAPIResponse = await response.json();
        this.root.dashboardStore.setBasicInfo(result.info);
      }
    } catch (error) {
      console.error("Network or Request Error:", error);
    }
  };
}
