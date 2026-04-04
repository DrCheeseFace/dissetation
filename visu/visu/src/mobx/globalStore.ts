import { autorun, makeAutoObservable } from 'mobx';

import { RootStore } from '@/mobx/rootstore.ts';
import { Page } from '@/model/Page';
import {
  healthCheck as healthCheckurl,
  uploadParentFile,
} from '@/utils/routes.ts';

export class GlobalStore {
  root: RootStore;
  currentPage: Page = Page.LandingPage;

  loading: boolean = false;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    const persistedData = localStorage.getItem('GlobalStore');
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      this.currentPage = parsed.currentPage;
    }

    autorun(() => {
      localStorage.setItem(
        'GlobalStore',
        JSON.stringify({
          currentPage: this.currentPage,
        }),
      );
    });
  }

  debugReset = () => {
    console.debug('debug resetting');
    this.currentPage = Page.LandingPage;
  };

  setPage = (page: Page) => {
    this.currentPage = page;
  };

  setUploading = (uploading: boolean) => {
    this.loading = uploading;
  };

  uploadParentFile = async (file: File | null) => {
    if (!file) return;
    this.setUploading(true);

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch(uploadParentFile, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await this.root.fileStore.fetchBasicInfo();
        if (this.root.fileStore.parentFile?.uuid) {
          this.root.missigStore.fetchMissiGInfo(
            this.root.fileStore.parentFile?.uuid,
          );
        } else {
          throw new Error('failed to get parent file info');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.setUploading(false);
      this.setPage(Page.Dashboard);
    }
  };

  healthCheck = async (): Promise<void> => {
    try {
      const response = await fetch(healthCheckurl, {
        method: 'GET',
      });

      if (response.ok) {
        alert(JSON.stringify(response.statusText));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
