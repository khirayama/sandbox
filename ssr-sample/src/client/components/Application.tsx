import * as React from 'react';
import { connect } from 'react-redux';

import { ResetStyle, GlobalStyle } from 'client/components/Styles';
import { chooseLocale } from 'client/components/SampleComponent.locale';
import { IntlProvider } from 'react-intl';
import { Sample } from 'client/components/SampleComponent';

const mapStateToProps = (state: any) => {
  return {
    locale: state.ui.locale,
  };
}

function Component(props: any) {
  const locale: string = props.locale;

  return (
    <>
      <ResetStyle />
      <GlobalStyle />
      <IntlProvider locale={locale} messages={chooseLocale(locale)}>
        <Sample />
      </IntlProvider>
    </>
  );
}

export const Application = connect(mapStateToProps, null)(Component);
