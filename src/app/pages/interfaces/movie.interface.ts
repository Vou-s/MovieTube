export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Plot?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Runtime?: string;
  Released?: string;
  Writer?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Metascore?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

export interface MovieSearchResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface MovieDetailResponse extends Movie {
  Response: string;
  Error?: string;
}

export interface MovieCategory {
  id: string;
  name: string;
  searchTerm: string;
}

// Helper interface untuk internal use
export interface ProcessedMovie {
  id: string;
  title: string;
  year: string;
  poster: string;
  plot: string;
  rating: number;
  genre: string;
  director: string;
  actors: string;
  runtime: string;
  type: string;
}
