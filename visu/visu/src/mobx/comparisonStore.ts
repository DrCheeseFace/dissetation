import { makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { getComparison, getRows, getSample } from '@/utils/routes';
import type { SampleData } from '@/model/Sample';
import type { ComparisonResponse } from '@/model/ComparisonInfo';

export class ComparisonStore {
  root: RootStore;
  parentFile?: BasicInfo;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  fetchSample = async (uuid: UUID, count: number): Promise<SampleData> => {
    const response = await fetch(getSample(uuid, count), {
      method: 'GET',
    });
    return response.json();
  };

  fetchRows = async (
    uuid: UUID,
    row_indexes: number[],
  ): Promise<SampleData> => {
    const response = await fetch(getRows(uuid), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row_indexes: row_indexes }),
    });
    return response.json();
  };

  fetchComparison = async (
    baseuuid: UUID,
    childuuid: UUID,
  ): Promise<ComparisonResponse> => {
    const response = await fetch(getComparison(baseuuid, childuuid), {
      method: 'GET',
    });
    return response.json();
  };
}
