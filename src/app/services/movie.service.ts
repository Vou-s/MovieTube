import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map, timeout, switchMap } from 'rxjs/operators';
import { Movie, MovieSearchResponse, MovieDetailResponse, ProcessedMovie } from '../pages/interfaces/movie.interface';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_KEY = environment.omdbApiKey;
  private readonly API_BASE_URL = environment.omdbBaseUrl;
  private readonly PLACEHOLDER_IMAGE = environment.placeholder;

  // Sample data untuk fallback
  private readonly sampleMovies: ProcessedMovie[] = [
    {
      id: 'tt0137523',
      title: 'Fight Club',
      year: '1999',
      poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg',
      plot: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into an anarchist organization.',
      rating: 8.8,
      genre: 'Drama',
      director: 'David Fincher',
      actors: 'Brad Pitt, Edward Norton, Meat Loaf',
      runtime: '139 min',
      type: 'movie'
    },
    {
      id: 'tt0109830',
      title: 'Forrest Gump',
      year: '1994',
      poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
      plot: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.',
      rating: 8.8,
      genre: 'Drama, Romance',
      director: 'Robert Zemeckis',
      actors: 'Tom Hanks, Robin Wright, Gary Sinise',
      runtime: '142 min',
      type: 'movie'
    },
    {
      id: 'tt0111161',
      title: 'The Shawshank Redemption',
      year: '1994',
      poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
      plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      rating: 9.3,
      genre: 'Drama',
      director: 'Frank Darabont',
      actors: 'Tim Robbins, Morgan Freeman, Bob Gunton',
      runtime: '142 min',
      type: 'movie'
    },
    {
      id: 'tt0068646',
      title: 'The Godfather',
      year: '1972',
      poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
      plot: 'An organized crime dynasty\'s aging patriarch transfers control of his clandestine empire to his reluctant son.',
      rating: 9.2,
      genre: 'Crime, Drama',
      director: 'Francis Ford Coppola',
      actors: 'Marlon Brando, Al Pacino, James Caan',
      runtime: '175 min',
      type: 'movie'
    },
    {
      id: 'tt0816692',
      title: 'Interstellar',
      year: '2014',
      poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
      plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      rating: 8.6,
      genre: 'Adventure, Drama, Sci-Fi',
      director: 'Christopher Nolan',
      actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
      runtime: '169 min',
      type: 'movie'
    },
    {
      id: 'tt1375666',
      title: 'Inception',
      year: '2010',
      poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
      plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into a CEO\'s mind.',
      rating: 8.8,
      genre: 'Action, Sci-Fi, Thriller',
      director: 'Christopher Nolan',
      actors: 'Leonardo DiCaprio, Marion Cotillard, Tom Hardy',
      runtime: '148 min',
      type: 'movie'
    }
  ];

  constructor(private http: HttpClient) { }

  // Search movies by query
  searchMovies(query: string, page: number = 1): Observable<{ movies: ProcessedMovie[], totalResults: number }> {
    if (!query.trim()) {
      return of({ movies: [], totalResults: 0 });
    }

    const params = new HttpParams()
      .set('apikey', this.API_KEY)
      .set('s', query.trim())
      .set('type', 'movie')
      .set('page', page.toString());

    return this.http.get<MovieSearchResponse>(`${this.API_BASE_URL}`, { params })
      .pipe(
        timeout(10000),
        map(response => {
          if (response.Response === 'True' && response.Search) {
            const movies = response.Search.map(movie => this.transformMovie(movie));
            return {
              movies,
              totalResults: parseInt(response.totalResults || '0')
            };
          } else {
            return { movies: [], totalResults: 0 };
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Get movies by category (menggunakan search terms populer)
  getMoviesByCategory(category: string): Observable<{ movies: ProcessedMovie[], totalResults: number }> {
    const searchTerms = this.getCategorySearchTerms(category);

    // Melakukan multiple search untuk kategori
    const searches = searchTerms.map(term =>
      this.searchMoviesByTerm(term).pipe(
        catchError(() => of({ movies: [], totalResults: 0 }))
      )
    );

    return forkJoin(searches).pipe(
      map(results => {
        // Gabungkan hasil dari multiple searches
        const allMovies: ProcessedMovie[] = [];
        let totalResults = 0;

        results.forEach(result => {
          allMovies.push(...result.movies);
          totalResults += result.totalResults;
        });

        // Remove duplicates dan limit
        const uniqueMovies = this.removeDuplicates(allMovies).slice(0, 20);

        return {
          movies: uniqueMovies,
          totalResults: uniqueMovies.length
        };
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Get trending movies (simulasi dengan film populer)
  getTrendingMovies(): Observable<{ movies: ProcessedMovie[], totalResults: number }> {
    const trendingTerms = ['Marvel', 'Batman', 'Star Wars', 'Harry Potter'];

    const searches = trendingTerms.map(term =>
      this.searchMoviesByTerm(term).pipe(
        catchError(() => of({ movies: [], totalResults: 0 }))
      )
    );

    return forkJoin(searches).pipe(
      map(results => {
        const allMovies: ProcessedMovie[] = [];

        results.forEach(result => {
          allMovies.push(...result.movies.slice(0, 3)); // Ambil 3 teratas dari setiap kategori
        });

        const uniqueMovies = this.removeDuplicates(allMovies);

        return {
          movies: uniqueMovies,
          totalResults: uniqueMovies.length
        };
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Get movie detail
  getMovieDetail(imdbId: string): Observable<ProcessedMovie> {
    const params = new HttpParams()
      .set('apikey', this.API_KEY)
      .set('i', imdbId)
      .set('plot', 'full');

    return this.http.get<MovieDetailResponse>(`${this.API_BASE_URL}`, { params })
      .pipe(
        timeout(10000),
        map(response => {
          if (response.Response === 'True') {
            return this.transformMovieDetail(response);
          } else {
            throw new Error(response.Error || 'Movie not found');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Helper: Search movies by specific term
  private searchMoviesByTerm(term: string): Observable<{ movies: ProcessedMovie[], totalResults: number }> {
    const params = new HttpParams()
      .set('apikey', this.API_KEY)
      .set('s', term)
      .set('type', 'movie');

    return this.http.get<MovieSearchResponse>(`${this.API_BASE_URL}`, { params })
      .pipe(
        map(response => {
          if (response.Response === 'True' && response.Search) {
            const movies = response.Search
              .filter(movie => parseInt(movie.Year) >= 2000) // Filter film modern
              .map(movie => this.transformMovie(movie));
            return {
              movies,
              totalResults: parseInt(response.totalResults || '0')
            };
          }
          return { movies: [], totalResults: 0 };
        })
      );
  }

  // Helper: Transform OMDB movie to internal format
  private transformMovie(movie: Movie): ProcessedMovie {
    return {
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: this.getImageUrl(movie.Poster),
      plot: movie.Plot || 'Plot tidak tersedia.',
      rating: parseFloat(movie.imdbRating || '0'),
      genre: movie.Genre || 'Unknown',
      director: movie.Director || 'Unknown',
      actors: movie.Actors || 'Unknown',
      runtime: movie.Runtime || 'N/A',
      type: movie.Type
    };
  }

  // Helper: Transform OMDB movie detail to internal format
  private transformMovieDetail(movie: MovieDetailResponse): ProcessedMovie {
    return {
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: this.getImageUrl(movie.Poster),
      plot: movie.Plot || 'Plot tidak tersedia.',
      rating: parseFloat(movie.imdbRating || '0'),
      genre: movie.Genre || 'Unknown',
      director: movie.Director || 'Unknown',
      actors: movie.Actors || 'Unknown',
      runtime: movie.Runtime || 'N/A',
      type: movie.Type
    };
  }

  // Helper: Get search terms for categories
  private getCategorySearchTerms(category: string): string[] {
    const categoryTerms: { [key: string]: string[] } = {
      'popular': ['Marvel', 'Batman', 'action', 'adventure'],
      'top_rated': ['Godfather', 'Shawshank', 'Lord of the Rings', 'Inception'],
      'upcoming': ['2024', '2023', 'recent'],
      'now_playing': ['2024', '2023'],
      'comedy': ['comedy', 'funny', 'laugh'],
      'drama': ['drama', 'story', 'life'],
      'thriller': ['thriller', 'suspense', 'mystery'],
      'horror': ['horror', 'scary', 'fear']
    };

    return categoryTerms[category] || ['movie'];
  }

  // Helper: Remove duplicate movies
  private removeDuplicates(movies: ProcessedMovie[]): ProcessedMovie[] {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }

  // Helper: Get image URL with fallback
  getImageUrl(posterUrl: string | null): string {
    if (!posterUrl || posterUrl === 'N/A' || posterUrl.includes('@@')) {
      return this.PLACEHOLDER_IMAGE;
    }
    return posterUrl;
  }

  // Helper: Format rating
  formatRating(rating: number): string {
    if (rating === 0) return 'N/A';
    return rating.toFixed(1);
  }

  // Helper: Get release year
  getReleaseYear(year: string): string {
    return year || 'Unknown';
  }

  // Check API connection
  checkApiConnection(): Observable<boolean> {
    const params = new HttpParams()
      .set('apikey', this.API_KEY)
      .set('i', 'tt0111161'); // Test dengan Shawshank Redemption

    return this.http.get<MovieDetailResponse>(`${this.API_BASE_URL}`, { params })
      .pipe(
        map(response => response.Response === 'True'),
        catchError(() => of(false))
      );
  }

  // Error handler dengan fallback
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error('OMDB API Error:', error);

    let errorMessage = 'Terjadi kesalahan saat mengambil data film.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'API key tidak valid. Silakan periksa konfigurasi.';
          break;
        case 404:
          errorMessage = 'Data tidak ditemukan.';
          break;
        case 429:
          errorMessage = 'Limit API tercapai. Silakan coba lagi nanti.';
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah. Silakan coba lagi.';
          break;
        default:
          errorMessage = `Server mengembalikan kode: ${error.status}`;
      }
    }

    console.log('Menggunakan sample data sebagai fallback...');

    // Return fallback data
    return of({
      movies: this.sampleMovies,
      totalResults: this.sampleMovies.length
    });
  }
}
