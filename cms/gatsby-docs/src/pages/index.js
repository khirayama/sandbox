import React from 'react';

export default function(props) {
  setTimeout(() => {
    props.navigate('/welcome');
  }, 0);
  return null;
}
