import * as firebase from 'firebase/app';
import 'firebase/auth';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { secret } from 'secret';
import { App } from 'components/App';

window.addEventListener('DOMContentLoaded', () => {
  console.log(`Start an app at ${new Date().toString()}.`);

  const config: any = {
    apiKey: secret.FIREBASE_API_KEY,
    authDomain: `${secret.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${secret.FIREBASE_PROJECT_ID}.firebaseio.com`,
    storageBucket: `${secret.FIREBASE_PROJECT_ID}.appspot.com`,
  };
  firebase.initializeApp(config);

  const email: string = 'test@sample.com';
  const password: string = 'password';
  firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });

  const el: HTMLElement = window.document.querySelector('.app');
  ReactDOM.render(<App />, el);
});
