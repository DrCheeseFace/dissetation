import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import type { BasicInfo, BasicInfoApiResponse } from '@/model/BasicInfo';
import { deleteChildFile, getBasicInfo, simpleImpute } from '@/utils/routes';

export class FileStore {
  root: RootStore;
  parentFile?: BasicInfo;
  childFiles: BasicInfo[];

  constructor(root: RootStore) {
    this.root = root;
    this.childFiles = [];
    makeAutoObservable(this);

    const persistedData = localStorage.getItem('FileStore');
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      this.parentFile = parsed.parentFile;
      this.childFiles = parsed.childFiles;
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

  // TODO VERIFY FILE NAME
  // TODO ACTUALLY IMPLEMENT
  testimpute = async () => {
    try {
      const response = await fetch(simpleImpute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'cholesteral_mean_imputation.csv',
          strategy: 'mean',
          Feature: 'Cholesterol',
        }),
      });
      if (response.ok) {
        await this.fetchBasicInfo();
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('an error occured when fetching basic info: ', error);
    }
  };

  // TODO ACTUALLY IMPLEMENT
  testDeleteChildNode = async () => {
    try {
      const response = await fetch(deleteChildFile(this.childFiles[0].uuid), {
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
