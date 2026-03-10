import { makeAutoObservable } from "mobx";

import { RootStore } from "@/mobx/rootstore.ts";
import { Page } from "@/model/Page";
import { healthCheck, uploadParentFile } from "@/utils/routes.ts";

export class GlobalStore {
  root: RootStore;
  currentPage: Page = Page.LandingPage;

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
        await this.root.dashboardStore.fetchParentFileMissiGInfo();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.setUploading(false);
      this.setPage(Page.Dashboard);
    }
  };

  healthCheck = async (): Promise<void> => {
    try {
      const response = await fetch(healthCheck, {
        method: "GET",
      });

      if (response.ok) {
        alert(JSON.stringify(response.statusText));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
}
