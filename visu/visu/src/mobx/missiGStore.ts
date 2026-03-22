import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type {
  BasicInfoAPIResponse as MissiGInfoApiResponse,
  DatasetSummary,
} from '@/model/MissiG';
import { getMissiGInfo } from '@/utils/routes';

export class MissiGStore {
  root: RootStore;
  ParentFileMissiGInfo?: DatasetSummary;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
    const persistedData = localStorage.getItem('MissiGStore');
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      this.ParentFileMissiGInfo = parsed.ParentFileMissiGInfo;
    }

    autorun(() => {
      localStorage.setItem(
        'MissiGStore',
        JSON.stringify({
          ParentFileMissiGInfo: this.ParentFileMissiGInfo,
        }),
      );
    });
  }

  setMissiGInfo = (info: DatasetSummary) => {
    this.ParentFileMissiGInfo = info;
  };

  fetchParentFileMissiGInfo = async () => {
    try {
      const response = await fetch(getMissiGInfo, {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: MissiGInfoApiResponse = await response.json();
        this.root.missigStore.setMissiGInfo(rawResult.info);
      }
    } catch (error) {
      console.error('an error occured when fetching parent file info: ', error);
    }
  };
}
