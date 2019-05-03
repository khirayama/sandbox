import * as React from 'react';
import { connect } from 'react-redux';

import { changeLocale } from 'client/actions';

export function Component(props: any) {
  return (
    <ul>
      <li onClick={props.onEnglishLocaleClick}>English</li>
      <li onClick={props.onJapaneseLocaleClick}>日本語</li>
    </ul>
  );
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onEnglishLocaleClick: () => {
      dispatch(changeLocale('en'));
    },
    onJapaneseLocaleClick: () => {
      dispatch(changeLocale('ja'));
    },
  }
}

export const LocaleBar = connect(null, mapDispatchToProps)(Component);
