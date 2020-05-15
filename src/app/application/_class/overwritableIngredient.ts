import {Ingredient} from '../_interfaces/firestoreDatatypes';


export class OverwritableIngredient {

  private ingStack: Ingredient[] = [];
  private sourceIdStack: string[] = [];

  constructor(ing: Ingredient, id: string) {

    this.ingStack.push(ing);
    this.sourceIdStack.push(id);

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

    return this.ingStack[this.ingStack.length - 1];

  }

  /**
   *
   * @param documentId id of the document
   */
  public removeOverwiting(documentId) {

    if (this.sourceIdStack.includes(documentId)) {

      const index = this.sourceIdStack.indexOf(documentId);

      if (index === 0) {
        throw new Error(`Can't delete original`);
      }

      this.sourceIdStack.splice(index, 1);
      this.ingStack.splice(index, 1);

    }

  }

  /**
   * Adds a new Layer over overwiten data
   *
   */
  public addOverwite(ing: Ingredient, id: string) {

    if (this.sourceIdStack.includes(id)) {
      throw new Error('Already overwitten by this document.');
    }

    this.ingStack.push(ing);
    this.sourceIdStack.push(id);

  }

}
