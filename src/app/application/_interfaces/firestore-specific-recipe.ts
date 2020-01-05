export interface FirestoreSpecificRecipe {

  participants: number;
  campId: string;
  overrideParticipants: boolean;
  specificMealId: string;
  vegi: 'all' | 'vegiOnly' | 'nonVegi';
  
}
