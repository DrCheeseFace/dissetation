import { makeAutoObservable } from "mobx";

import { RootStore } from "@/mobx/rootstore.ts";
import { Page } from "@/model/Page";
import { healthCheck, uploadParentFile } from "@/utils/routes.ts";

export class GlobalStore {
  root: RootStore;
  currentPage: Page = Page.LandingPage;
  currentDataset?: File;

  REMOVEME_TEMP: number = 0; // TODO REMOVE ME
  uploading: boolean = false; // TODO REMOVE ME

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setPage = (page: Page) => {
    this.currentPage = page;
  };

  setUploading = (uploading: boolean) => {
    this.uploading = uploading;
  };

  incrementTemp = (): void => {
    this.REMOVEME_TEMP++;
  };

  decrementTemp = (): void => {
    this.REMOVEME_TEMP--;
  };

  uploadParentFile = async (file: File | null) => {
    if (!file) return;
    this.setUploading(true);

    const formData = new FormData();
    formData.append("myFile", file);

    try {
      const response = await fetch(uploadParentFile, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        this.setPage(Page.Dashboard);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.setUploading(false);
    }
  };

  healthCheck = async (): Promise<void> => {
    try {
      const response = await fetch(healthCheck, {
        method: "GET",
      });

      if (response.ok) {
        alert(JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
}
