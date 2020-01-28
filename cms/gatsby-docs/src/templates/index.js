import React from 'react';

export default function(props) {
  const locale = props.pageContext.locale;
  const summary = props.pageContext.summary[locale];
  const firstItem = summary[0];
  if (firstItem.slug !== props.path) {
    setTimeout(() => {
      props.navigate(firstItem.slug);
    }, 0);
  }
  return null;
}
