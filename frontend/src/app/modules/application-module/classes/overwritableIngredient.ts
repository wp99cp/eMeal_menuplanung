import {Ingredient} from '../interfaces/firestoreDatatypes';

/**
 *
 */
export interface OverwritenIngredient extends Ingredient {
  isAnOverwriting: boolean;
}


/**
 *
 */
export class OverwritableIngredient {

  private ingStack: Ingredient[] = [];
  private sourceIdStack: string[] = [];

  constructor(ing: Ingredient, id: string) {

    this.ingStack.push(ing);
    this.sourceIdStack.push(id);

  }

  private static compare(ing1: Ingredient, ing2: Ingredient) {

    return ing1.food === ing2.food
      && ing1.unique_id === ing2.unique_id
      && ing1.comment === ing2.comment
      && ing1.fresh === ing2.fresh
      && ing1.measure === ing2.measure
      && ing1.unit === ing2.unit;

  }

  /**
   * Returns the default of this ingredient. This means
   * the ingredients on which this OverwritableIngredient has
   * been created.
   *
   * @returns the ingredient
   *
   */
  public getDefault() {

    return this.ingStack[0];

  }

  /**
   * Returns the ingredient with all its overwriten data
   *
   */
  public getOverwriten() {

    const ing = this.ingStack[this.ingStack.length - 1] as OverwritenIngredient;
    ing.isAnOverwriting = (this.ingStack.length > 1);
    return ing;

  }

  /**
   *
   * @param documentId id of the document
   */
  public removeOverwiting(documentId): Ingredient {

    if (this.sourceIdStack.includes(documentId)) {

      const index = this.sourceIdStack.indexOf(documentId);

      if (index === 0) {
        throw new Error(`Can't delete original`);
      }

      const ing = this.ingStack[index];

      this.sourceIdStack.splice(index, 1);
      this.ingStack.splice(index, 1);

      return ing;
    }

    return null;

  }

  /**
   * Adds a new Layer over overwiten data
   *
   */
  public addOverwite(ing: Ingredient, id: string) {

    if (this.sourceIdStack.includes(id)) {
      this.ingStack[this.sourceIdStack.indexOf(id)] = ing;
    }

    this.ingStack.push(ing);
    this.sourceIdStack.push(id);

  }

  public checkForTrivials() {
    this.sourceIdStack.filter(id => id !== this.sourceIdStack[0]).forEach(id => {
      if (OverwritableIngredient.compare(this.ingStack[this.sourceIdStack.indexOf(id)], this.getDefault())) {
        this.removeOverwiting(id);
        console.log('Trivial overwriting removed');
      }
    });
  }

}
