import {OperatorFunction} from 'rxjs';
import {distinctUntilChanged, map, scan} from 'rxjs/operators';
import {FirestoreObject} from './firebaseObject';

/** JSON with sorted keys, firestore does not return the keys of a map in the order they got written. */
function stringify(value: unknown): string {

  return JSON.stringify(value, (key, val) =>
    val !== null && typeof val === 'object' && !Array.isArray(val) ?
      Object.fromEntries(Object.entries(val).sort(([a], [b]) => a < b ? -1 : 1)) : val);

}

/**
 * Every write to a document loads the document again. An editor would get a new object for each automatic save and
 * render itself again, which loses the cell the user is typing in and the changes made in the meantime.
 *
 * This operator keeps the object the user is working with if the loaded document contains nothing new
 * or if the object has unsaved changes. In the second case the changes of the user win over the loaded ones.
 *
 * @param hasUnsavedChanges tells whether an object has changes that are not written to the database yet
 */
export function keepEditedObjects<T extends FirestoreObject>(hasUnsavedChanges: (object: T) => boolean): OperatorFunction<T[], T[]> {

  return source => source.pipe(
    scan((current: T[], loaded: T[]) => {

      const objects = loaded.map(loadedObject => {

        const currentObject = current.find(object => object.path === loadedObject.path);

        const keep = currentObject !== undefined && (hasUnsavedChanges(currentObject) ||
          stringify(currentObject.toFirestoreDocument()) === stringify(loadedObject.toFirestoreDocument()));

        return keep ? currentObject : loadedObject;

      });

      const unchanged = objects.length === current.length && objects.every((object, index) => object === current[index]);
      return unchanged ? current : objects;

    }, []),
    distinctUntilChanged()
  );

}

/**
 * The same as keepEditedObjects for a single document.
 */
export function keepEditedObject<T extends FirestoreObject>(hasUnsavedChanges: (object: T) => boolean): OperatorFunction<T, T> {

  return source => source.pipe(
    map(object => [object]),
    keepEditedObjects(hasUnsavedChanges),
    map(objects => objects[0])
  );

}
