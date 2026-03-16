import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type { BasicInfo, BasicInfoApiResponse, UUID } from '@/model/BasicInfo';
import {
  deleteChildFile,
  getBasicInfo,
  promoteChildFile,
  simpleImpute,
} from '@/utils/routes';
import type { SimpleImputationStrategy } from '@/model/SimpleImpute';

export class FileStore {
  root: RootStore;
  parentFile?: BasicInfo;
  childFiles: BasicInfo[];
  loading: boolean;

  constructor(root: RootStore) {
    this.root = root;
    this.childFiles = [];
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
      const response = await fetch(simpleImpute, {
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

  promoteChildNode = async (uuid: UUID) => {
    try {
      const response = await fetch(promoteChildFile(uuid), {
        method: 'PATCH',
      });
      if (response.ok) {
        await this.fetchBasicInfo();
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error(
        'an error occured when trying to promote child node: ',
        error,
      );
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
}
