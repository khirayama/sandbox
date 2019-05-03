import * as React from 'react';
import { IntlProvider } from 'react-intl';

import { ResetStyle } from 'client/components/ResetStyle';
import { GlobalStyle } from 'client/components/GlobalStyle';
import { chooseLocale } from 'client/components/locales';
import { State } from 'client/reducers';
import { Routes } from 'client/routes/Routes';

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
