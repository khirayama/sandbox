import { all, fork } from 'redux-saga/effects';

import { pagesProcess } from './pages';

export function* rootSaga() {
  yield all([fork(pagesProcess)]);
}
