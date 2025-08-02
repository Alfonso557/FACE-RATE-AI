export enum AppState {
  IDLE,
  CAPTURING,
  ANALYZING,
  RESULT,
  ERROR,
}

export interface BeautyRating {
  rating: number;
  analysis: string;
  title: string;
}
