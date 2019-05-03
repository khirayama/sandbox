import { addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import jaLocaleData from 'react-intl/locale-data/ja';

addLocaleData(enLocaleData);
addLocaleData(jaLocaleData);

export const en = {
  'Counter.Label': 'Counted by {name}: ',
};

export const ja = {
  'Counter.Label': '{name}さんのカウント数: ',
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
