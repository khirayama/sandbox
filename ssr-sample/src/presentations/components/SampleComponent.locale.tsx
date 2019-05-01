import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import jaLocaleData from 'react-intl/locale-data/ja';

addLocaleData(enLocaleData);
addLocaleData(jaLocaleData);

export const en = {
  'SampleComponent.Hello': 'Hello, {name}',
};

export const ja = {
  'SampleComponent.Hello': 'こんにちは、{name}',
};

export function chooseLocale(locale: string) {
  switch(locale) {
    case 'en':
      return en;
    case 'ja':
      return ja;
    default:
      return en;
  }
}
