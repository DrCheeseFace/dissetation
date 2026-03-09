import { makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type { BasicInfoAPIResponse, DatasetSummary } from '@/model/MissiG';
import { getMissiGInfo } from '@/utils/routes';

export class DashboardStore {
  root: RootStore;
  MissiGInfo?: DatasetSummary; // TODO make persist

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setMissiGInfo = (info: DatasetSummary) => {
    this.MissiGInfo = info;
  };

  fetchMissiGInfo = async () => {
    try {
      const response = await fetch(getMissiGInfo, {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: BasicInfoAPIResponse = await response.json();
        this.root.dashboardStore.setMissiGInfo(rawResult.info);
      }
    } catch (error) {
      console.error('an error occured when fetching parent file info: ', error);
    }
  };
}
