export enum FieldState {
  LOADING = 'loading', // eslint-disable-line no-unused-vars
  ERROR = 'error', // eslint-disable-line no-unused-vars
  SUCCESS = 'success', // eslint-disable-line no-unused-vars
  DEFAULT = 'default', // eslint-disable-line no-unused-vars
}

export type ErrorMsgString = string;
export type StatefullFieldState = {
  state: FieldState;
  stateMsg: ErrorMsgString;
};
