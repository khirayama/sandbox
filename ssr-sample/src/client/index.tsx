import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';

import { reducer } from 'client/reducers';
import { Sample } from 'client/components/SampleComponent';
import { ResetStyle, GlobalStyle } from 'client/components/Styles';
import { chooseLocale } from 'client/components/SampleComponent.locale';

function extractInitialState() {
  const initialDataElement = window.document.querySelector('#initial-data');
  if (initialDataElement) {
    const initialDataString = initialDataElement.getAttribute('data-json');
    if (initialDataString) {
      return JSON.parse(initialDataString);
    } else {
      return {
        count: 0,
      };
    }
  }
}

const store = createStore(reducer, extractInitialState());

window.addEventListener('DOMContentLoaded', () => {
  const locale: string = 'ja';

  ReactDOM.hydrate(
    <BrowserRouter>
      <ResetStyle />
      <GlobalStyle />
      <Provider store={store}>
        <IntlProvider locale={locale} messages={chooseLocale(locale)}>
          <Sample />
        </IntlProvider>
      </Provider>
    </BrowserRouter>,
    window.document.querySelector('#root'));
});
