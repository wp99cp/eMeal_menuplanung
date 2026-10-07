import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup,
  AngularFirestoreDocument,
  QueryFn,
  QueryGroupFn
} from '@angular/fire/compat/firestore';

/**
 * AngularFire's compat references call `inject()` when they get created. Hence, they can only be
 * created inside an injection context. As the app requests most documents and collections from
 * within async callbacks (e.g. after the user has been loaded), this wrapper restores that context.
 *
 */
@Injectable()
export class InjectionContextFirestore extends AngularFirestore {

  private readonly environmentInjector = inject(EnvironmentInjector);

  override collection<T>(pathOrRef: any, queryFn?: QueryFn): AngularFirestoreCollection<T> {
    return runInInjectionContext(this.environmentInjector, () => super.collection<T>(pathOrRef, queryFn));
  }

  override collectionGroup<T>(collectionId: string, queryGroupFn?: QueryGroupFn<T>): AngularFirestoreCollectionGroup<T> {
    return runInInjectionContext(this.environmentInjector, () => super.collectionGroup<T>(collectionId, queryGroupFn));
  }

  override doc<T>(pathOrRef: any): AngularFirestoreDocument<T> {
    return runInInjectionContext(this.environmentInjector, () => super.doc<T>(pathOrRef));
  }

}
