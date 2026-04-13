import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type {
  BasicInfoAPIResponse as MissiGInfoApiResponse,
  DatasetSummary,
} from '@/model/MissiG';
import { getMissiGInfo } from '@/utils/routes';
import type { UUID } from '@/model/BasicInfo';

export class MissiGStore {
  root: RootStore;
  missiGCache: Record<UUID, DatasetSummary> = {};
  currentMissiGUuid?: UUID;
  loading: boolean;

  constructor(root: RootStore) {
    this.root = root;
    this.loading = false;
    makeAutoObservable(this);

    const persistedData = localStorage.getItem('MissiGStoreCache');
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData);
        if (parsed.missiGCache) {
          this.missiGCache = parsed.missiGCache;
        }
      } catch (e) {
        console.error('Failed to parse MissiGStore cache', e);
      }
    }

    autorun(() => {
      localStorage.setItem(
        'MissiGStoreCache',
        JSON.stringify({
          missiGCache: this.missiGCache,
        }),
      );
    });
  }

  get currentMissiGInfo(): DatasetSummary | undefined {
    if (!this.currentMissiGUuid) return undefined;
    return this.missiGCache[this.currentMissiGUuid];
  }

  setMissiGInfo = (uuid: UUID, info: DatasetSummary) => {
    this.missiGCache[uuid] = info;
    this.currentMissiGUuid = uuid;
  };

  setCurrentUuid = (uuid: UUID) => {
    this.currentMissiGUuid = uuid;
  };

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  fetchMissiGInfo = async (uuid: UUID) => {
    // already have it
    if (this.missiGCache[uuid]) {
      this.setCurrentUuid(uuid);
      return;
    }

    this.setLoading(true);
    try {
      const response = await fetch(getMissiGInfo(uuid), {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: MissiGInfoApiResponse = await response.json();
        this.setMissiGInfo(uuid, rawResult.info);
      }
    } catch (error) {
      console.error('an error occured when fetching missig info: ', error);
    } finally {
      this.setLoading(false);
    }
  };
}
