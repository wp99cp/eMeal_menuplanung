export interface FirestoreSpecificRecipe {

  participants: number;
  campId: string;
  overrideParticipants: boolean;
  specificMealId: string;
  vegi: VegiStates;

}

export type VegiStates = 'all' | 'vegiOnly' | 'nonVegi';


