import { all, fork } from 'redux-saga/effects';

import { pagesProcess } from 'client/sagas/pages';
import { orgsProcess } from 'client/sagas/orgs';

/**
 * Root for saga
 */
export function* rootSaga() {
  yield all([fork(pagesProcess), fork(orgsProcess)]);
}
