import {Provider} from '@angular/core';
import {USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/compat/auth';
import {USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/compat/firestore';
import {USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/compat/functions';
import {environment} from '../../environments/environment';

/**
 * Connects AngularFire to the local firebase emulator suite instead of a hosted project.
 * The ports are defined in /backend/firebase-cloud-functions/firebase.emulator.json
 *
 * The storage emulator is connected in the application module, as storage is only loaded there.
 *
 */
export const emulatorProviders: Provider[] = !environment.useEmulators ? [] : [
  {provide: USE_AUTH_EMULATOR, useValue: ['http://localhost:9099']},
  {provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080]},
  {provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001]},
];
