import { END } from 'redux-saga';
import { put, call, select, takeLatest } from 'redux-saga/effects';

import {
  loadAppProcessSuccess,
  loadAppProcessFailure,
  loadTopPageSuccess,
  loadTopPageFailure,
  resetPageStatus
} from '../actions/pages';
import { setUserName } from '../actions/users';
import { getUsers } from './selectors';
import { State } from '../reducers';

// don't call `stopSaga`
function* appProcess() {
  try {
    // e.g. write common processing to be performed on all pages
    const users: State['users'] = yield select<State>(getUsers);

    if (users.name === '') {
      yield put(setUserName('hiroppy'));
    }
    yield put(loadAppProcessSuccess());
  } catch (err) {
    yield put(loadAppProcessFailure(err));
    if (!process.env.IS_BROWSER) yield call(stopSaga);
  }
}

function* loadTopPage() {
  try {
    yield put(loadTopPageSuccess());
  } catch (err) {
    yield put(loadTopPageFailure(err));
  } finally {
    if (!process.env.IS_BROWSER) yield call(stopSaga);
  }
}

function* stopSaga() {
  yield put(END);
}

function* changeLocation() {
  yield put(resetPageStatus());
}

export function* pagesProcess() {
  yield takeLatest('LOAD_APP_PROCESS', appProcess);
  yield takeLatest('LOAD_TOP_PAGE', loadTopPage);
  yield takeLatest('STOP_SAGA', stopSaga);
  yield takeLatest('@@router/LOCATION_CHANGE', changeLocation);
}
