import { type UUID } from '@/model/BasicInfo';

export const baseurl = '/api';
export const healthCheck = baseurl + '/health';

// dataset sub directory
export const uploadParentFile = baseurl + '/dataset';
export const deleteChildFile = (uuid: UUID) => `${baseurl}/dataset/${uuid}`;
export const commitChildFile = (uuid: UUID) => `${baseurl}/dataset/${uuid}`;
export const simpleImputeURL = baseurl + '/impute/simple';
export const knnImputeURL = baseurl + '/impute/knn';
export const revertToParentFile = (uuid: UUID) =>
  `${baseurl}/dataset/revert/${uuid}`;

// info sub directory
export const getBasicInfo = baseurl + '/info';
export const getMissiGInfo = baseurl + '/info/missiG';
export const getHistory = baseurl + '/info/history';
