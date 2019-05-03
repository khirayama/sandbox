import * as React from 'react';
import { IntlProvider } from 'react-intl';

import { ResetStyle } from 'client/components/styles/ResetStyle';
import { GlobalStyle } from 'client/components/styles/GlobalStyle';
import { Routes } from 'client/components/routes/Routes';
import { chooseLocale } from 'client/components/locales';
import { State } from 'client/reducers';

type Props = {
  locale: State['ui']['locale'];
};

export function Application(props: Props) {
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
