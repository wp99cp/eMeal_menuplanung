// Environment for the local firebase emulator suite, see /docu/Local_Development.md
export const environment = {
  production: false,
  useEmulators: true,
  // the fake accounts created by /dev/seed/seed.js
  devAccounts: [
    {email: 'leiterin@emeal.test', password: 'emeal-dev', description: 'Lea Lagerleiterin, besitzt das Beispiellager'},
    {email: 'koch@emeal.test', password: 'emeal-dev', description: 'Kim Koch, darf das Beispiellager bearbeiten'},
    {email: 'neu@emeal.test', password: 'emeal-dev', description: 'Noah Neu, hat noch keine Daten'},
    {email: 'admin@emeal.test', password: 'emeal-dev', description: 'Alex Admin, hat Admin-Rechte'}
  ],
  // projects with the prefix "demo-" only exist inside the emulators
  firebaseConfig: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-emeal.firebaseapp.com',
    databaseURL: 'https://demo-emeal.firebaseio.com',
    projectId: 'demo-emeal',
    storageBucket: 'demo-emeal.appspot.com',
    messagingSenderId: '0',
    appId: '1:0:web:0'
  },
  exportEndpoint: 'http://localhost:5000'
};
