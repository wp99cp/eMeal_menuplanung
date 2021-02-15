import { FirestoreSpecificRecipe, UserGroups } from '../_interfaces/firestoreDatatypes';
import { FirestoreObject, ExportableObject } from './firebaseObject';
import { Recipe } from './recipe';

export class SpecificRecipe extends FirestoreObject implements ExportableObject {

  public readonly path: string;
  public readonly documentId: string;

  public campId: string;

  public vegi: UserGroups;
  public participants: number;
  public overrideParticipants = false;

  public static createEmptySpecificRecipe(campId: string) {

    const specificRecipe = FirestoreObject.exportEmptyDocument('') as FirestoreSpecificRecipe;

    specificRecipe.recipe_participants = 1;
    specificRecipe.used_in_camp = campId;
    specificRecipe.recipe_override_participants = false;
    specificRecipe.recipe_used_for = 'all';

    return specificRecipe;

  }

  constructor(data: FirestoreSpecificRecipe, path: string) {

    super(data);

    this.path = path;
    this.documentId = path.substring(path.lastIndexOf('/') + 1);

    this.participants = data.recipe_participants;
    this.campId = data.used_in_camp;

    this.vegi = data.recipe_used_for;
    this.overrideParticipants = data.recipe_override_participants;


  }

  public toFirestoreDocument(): FirestoreSpecificRecipe {


    const recipe = super.toFirestoreDocument() as FirestoreSpecificRecipe;

    recipe.recipe_participants = this.participants;
    recipe.used_in_camp = this.campId;
    recipe.recipe_override_participants = this.overrideParticipants;
    recipe.recipe_used_for = this.vegi;
    recipe.recipe_specificId = this.documentId;

    return recipe;
  }


}
