import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type { BasicInfo, BasicInfoApiResponse, UUID } from '@/model/BasicInfo';
import {
  commitChildFile as commitChildFile,
  deleteChildFile,
  getBasicInfo,
  getHistory,
  knnImputeURL,
  revertToParentFile,
  simpleImputeURL,
} from '@/utils/routes';
import type { SimpleImputationStrategy } from '@/model/SimpleImpute';
import type { ParentHistoryResponse } from '@/model/HistoryInfo';

export class FileStore {
  root: RootStore;
  parentFile?: BasicInfo;
  history: BasicInfo[];
  childFiles: BasicInfo[];
  loading: boolean;

  constructor(root: RootStore) {
    this.root = root;
    this.childFiles = [];
    this.history = [];
    this.loading = false;
    makeAutoObservable(this);

    const persistedData = localStorage.getItem('FileStore');
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      this.parentFile = parsed.parentFile;
      this.childFiles = parsed.childFiles || [];
    }

    autorun(() => {
      localStorage.setItem(
        'FileStore',
        JSON.stringify({
          parentFile: this.parentFile,
          childFiles: this.childFiles,
        }),
      );
    });
  }

  setParentFile = (info?: BasicInfo) => {
    this.parentFile = info;
  };

  setChildFiles = (infos: BasicInfo[]) => {
    this.childFiles = infos;
  };

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  fetchBasicInfo = async () => {
    try {
      const response = await fetch(getBasicInfo, {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: BasicInfoApiResponse = await response.json();
        this.setChildFiles(rawResult.child_files);
        this.setParentFile(rawResult.parent_file);
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('an error occured when fetching basic info: ', error);
    }
  };

  simpleImpute = async (
    filename: string,
    feature: string,
    strategy: SimpleImputationStrategy,
  ) => {
    try {
      this.setLoading(true);
      const response = await fetch(simpleImputeURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: filename,
          strategy: strategy,
          Feature: feature,
        }),
      });
      if (response.ok) {
        await this.fetchBasicInfo();
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('an error occured when fetching basic info: ', error);
    } finally {
      this.setLoading(false);
    }
  };

  // TODO TEST WITHOUT CATAGORICAL DATA
  knnImpute = async (filename: string, n_neighbors: number) => {
    try {
      this.setLoading(true);
      const response = await fetch(knnImputeURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: filename,
          n_neighbors: n_neighbors,
        }),
      });
      if (response.ok) {
        await this.fetchBasicInfo();
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('an error occured when fetching basic info: ', error);
    } finally {
      this.setLoading(false);
    }
  };

  commitChildNode = async (uuid: UUID) => {
    try {
      const response = await fetch(commitChildFile(uuid), {
        method: 'PATCH',
      });
      if (response.ok) {
        await Promise.all([this.fetchBasicInfo(), this.fetchHistory()]);
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error(
        'an error occured when trying to commit child node: ',
        error,
      );
    }
  };

  fetchHistory = async () => {
    try {
      const response = await fetch(getHistory, {
        method: 'GET',
      });

      if (response.ok) {
        const rawResult: ParentHistoryResponse = await response.json();
        this.history = rawResult.parent_history;
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('an error occured when fetching history info: ', error);
    }
  };

  deleteChildNode = async (uuid: UUID) => {
    try {
      const response = await fetch(deleteChildFile(uuid), {
        method: 'DELETE',
      });
      if (response.ok) {
        await this.fetchBasicInfo();
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error(
        'an error occured when trying to delete child node: ',
        error,
      );
    }
  };

  revertToParentNode = async (uuid: UUID) => {
    try {
      const response = await fetch(revertToParentFile(uuid), {
        method: 'PATCH',
      });
      if (response.ok) {
        await Promise.all([this.fetchBasicInfo(), this.fetchHistory()]);
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error(
        'an error occured when trying to delete child node: ',
        error,
      );
    }
  };
}
