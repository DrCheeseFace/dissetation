import { makeAutoObservable } from "mobx";

import { RootStore } from "./rootstore.ts";
import { healthCheck, testUploadFile } from "@/utils/routes.ts";

export class GlobalStore {
  root: RootStore;
  REMOVEME_TEMP: number = 0;
  uploading: boolean = false;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setUploading = (uploading: boolean) => {
    this.uploading = uploading;
  };

  IncrementTemp = (): void => {
    this.REMOVEME_TEMP++;
  };

  DecrementTemp = (): void => {
    this.REMOVEME_TEMP--;
  };

  TestUploadFile = async (file: File | null) => {
    if (!file) return;
    this.setUploading(true);

    const formData = new FormData();
    formData.append("myFile", file); // TODO do i need this

    try {
      // TODO routing to /api
      const response = await fetch(testUploadFile, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Upload complete!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.setUploading(false);
    }
  };

  HealthCheck = async (): Promise<void> => {
    try {
      const response = await fetch(healthCheck, {
        method: "GET",
      });

      if (response.ok) {
        alert("life is good");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

}
