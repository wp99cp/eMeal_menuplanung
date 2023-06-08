export interface HitobitoProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
}

export enum Provider {
  CEVI_DB = 'cevi-db',
  MI_DATA = 'mi-data',
  GOOGLE = 'google',
  CREDENTIALS = 'credentials',
}
