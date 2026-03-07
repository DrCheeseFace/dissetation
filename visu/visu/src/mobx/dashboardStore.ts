import { makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type {
  BasicInfoAPIResponse,
  DatasetSummary,
} from '@/model/DashboardInfo';
import { getParentFileInfo } from '@/utils/routes';

export class DashboardStore {
  root: RootStore;
  basicInfo?: DatasetSummary; // TODO make persist

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setBasicInfo = (info: DatasetSummary) => {
    this.basicInfo = info;
  };

  fetchParentFileInfo = async () => {
    try {
      const response = await fetch(getParentFileInfo, {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: BasicInfoAPIResponse = await response.json();
        this.root.dashboardStore.setBasicInfo(rawResult.info);
      }
    } catch (error) {
      console.error('an error occured when fetching parent file info: ', error);
    }
  };
}
