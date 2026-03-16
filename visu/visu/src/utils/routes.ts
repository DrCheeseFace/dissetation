import { type UUID } from '@/model/BasicInfo';

export const baseurl = '/api';
export const healthCheck = baseurl + '/health';

export const uploadParentFile = baseurl + '/dataset';
export const getBasicInfo = baseurl + '/dataset';

export const deleteChildFile = (uuid: UUID) => `${baseurl}/dataset/${uuid}`;

export const promoteChildFile = (uuid: UUID) => `${baseurl}/dataset/${uuid}`;

export const getMissiGInfo = baseurl + '/dataset/missiG';

export const simpleImpute = baseurl + '/dataset/simple_impute';
