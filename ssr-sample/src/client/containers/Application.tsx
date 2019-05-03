import * as React from 'react';
import { connect } from 'react-redux';

import { ResetStyle, GlobalStyle } from 'client/components/Styles';
import { chooseLocale } from 'client/components/locales';
import { IntlProvider } from 'react-intl';
import { Routes } from 'client/routes/Routes';
import { State } from 'client/reducers';

type Props = {
  locale: State['ui']['locale'];
};

const mapStateToProps = (state: State) => {
  return {
    locale: state.ui.locale,
  };
}

function Component(props: Props) {
  const locale: string = props.locale;

  return (
    <>
      <ResetStyle />
      <GlobalStyle />
      <IntlProvider locale={locale} messages={chooseLocale(locale)}>
        <Routes />
      </IntlProvider>
    </>
  );
}

export const Application = connect(mapStateToProps, null)(Component);
