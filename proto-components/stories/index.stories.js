import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { ContentEditableText } from 'block-editor/ContentEditableText';

storiesOf('ContentEditableText', module)
  .add('with text', () => <ContentEditableText value="Hello World" />);
