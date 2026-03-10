import { makeAutoObservable } from "mobx";

import { RootStore } from "@/mobx/rootstore.ts";
import type {
  BasicInfoAPIResponse as MissiGInfoApiResponse,
  DatasetSummary,
} from "@/model/MissiG";
import { getBasicInfo, getMissiGInfo } from "@/utils/routes";
import type { BasicInfoApiResponse } from "@/model/BasicInfo";

export class DashboardStore {
  root: RootStore;
  ParentFileMissiGInfo?: DatasetSummary; // TODO make persist

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setMissiGInfo = (info: DatasetSummary) => {
    this.ParentFileMissiGInfo = info;
  };

  fetchParentFileMissiGInfo = async () => {
    try {
      const response = await fetch(getMissiGInfo, {
        method: "GET",
      });

      if (response.ok) {
        const rawResult: MissiGInfoApiResponse = await response.json();
        this.root.dashboardStore.setMissiGInfo(rawResult.info);
      }
    } catch (error) {
      console.error("an error occured when fetching parent file info: ", error);
    }
  };

  fetchBasicInfo = async () => {
    try {
      const response = await fetch(getBasicInfo, {
        method: "GET",
      });

      if (response.ok) {
        const rawResult: BasicInfoApiResponse = await response.json();
        console.log("Parsed Data:", rawResult);
      } else {
        console.error("HTTP Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("an error occured when fetching basic info: ", error);
    }
  };
}
