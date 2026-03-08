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
  selectedGlyphIdx: number; // is -1 if not set

  constructor(root: RootStore) {
    this.root = root;
    this.selectedGlyphIdx = -1;
    makeAutoObservable(this);
  }

  setBasicInfo = (info: DatasetSummary) => {
    this.basicInfo = info;
  };

  setSelectedGlyph = (featureName?: string) => {
    if (!this.basicInfo || !featureName) {
      this.selectedGlyphIdx = -1;
      return;
    }

    this.selectedGlyphIdx = this.basicInfo.columns.findIndex(
      (col) => col.column_name === featureName,
    );
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
