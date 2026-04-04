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
export const getMissiGInfo = (uuid: UUID) => `${baseurl}/info/${uuid}/missiG`;
export const getMissingMatrixInfo = (uuid: UUID) =>
  `${baseurl}/info/${uuid}/missing_matrix`;

export const getHistory = baseurl + '/info/history';
export const getSample = (uuid: UUID, sampleSize: number) =>
  `${baseurl}/info/${uuid}/sample/${sampleSize}`;
export const getRows = (uuid: UUID) => `${baseurl}/info/${uuid}/rows`;
export const getComparison = (base: UUID, child: UUID) =>
  `${baseurl}/info/compare/${base}/${child}`;
