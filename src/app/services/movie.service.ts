import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Movie, MovieResponse, Genre } from '../pages/interfaces/movie.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_KEY = environment.tmdbApiKey;
  private readonly API_BASE_URL = environment.tmdbBaseUrl;
  private readonly IMAGE_BASE_URL = environment.tmdbImageUrl;

  // Backup sample data jika API gagal
  private readonly sampleMovies: Movie[] = [
    {
      id: 550,
      title: "Fight Club",
      overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
      vote_average: 8.4,
      vote_count: 26280,
      release_date: "1999-10-15",
      genre_ids: [18],
      adult: false,
      original_language: "en",
      original_title: "Fight Club",
      popularity: 61.416,
      video: false
    },
    {
      id: 13,
      title: "Forrest Gump",
      overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      backdrop_path: "/3h1JZGDhZ8nzxdgvkxha0qBqi1A.jpg",
      vote_average: 8.5,
      vote_count: 24930,
      release_date: "1994-06-23",
      genre_ids: [35, 18, 10749],
      adult: false,
      original_language: "en",
      original_title: "Forrest Gump",
      popularity: 58.153,
      video: false
    },
    {
      id: 278,
      title: "The Shawshank Redemption",
      overview: "Framed in the 1940s for double murder, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
      poster_path: "/q6y0Go1TsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg",
      vote_average: 8.7,
      vote_count: 23000,
      release_date: "1994-09-23",
      genre_ids: [18, 80],
      adult: false,
      original_language: "en",
      original_title: "The Shawshank Redemption",
      popularity: 89.931,
      video: false
    }
  ];

  constructor(private http: HttpClient) { }

  // Mendapatkan film berdasarkan kategori
  getMoviesByCategory(category: string, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'id-ID')
      .set('page', page.toString())
      .set('region', 'ID');

    return this.http.get<MovieResponse>(`${this.API_BASE_URL}/movie/${category}`, { params })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(this.handleError.bind(this))
      );
  }

  // Mencari film
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    if (!query.trim()) {
      return of({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }

    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'id-ID')
      .set('query', query.trim())
      .set('page', page.toString())
      .set('include_adult', 'false');

    return this.http.get<MovieResponse>(`${this.API_BASE_URL}/search/movie`, { params })
      .pipe(
        timeout(10000),
        catchError(this.handleError.bind(this))
      );
  }

  // Mendapatkan detail film
  getMovieDetail(id: number): Observable<Movie> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'id-ID');

    return this.http.get<Movie>(`${this.API_BASE_URL}/movie/${id}`, { params })
      .pipe(
        timeout(10000),
        catchError(this.handleError.bind(this))
      );
  }

  // Mendapatkan genre list
  getGenres(): Observable<Genre[]> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'id-ID');

    return this.http.get<{ genres: Genre[] }>(`${this.API_BASE_URL}/genre/movie/list`, { params })
      .pipe(
        map(response => response.genres),
        catchError(() => of([]))
      );
  }

  // Mendapatkan film trending
  getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.API_KEY)
      .set('language', 'id-ID');

    return this.http.get<MovieResponse>(`${this.API_BASE_URL}/trending/movie/${timeWindow}`, { params })
      .pipe(
        timeout(10000),
        catchError(this.handleError.bind(this))
      );
  }

  // Helper untuk mendapatkan URL gambar
  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) {
      return 'https://via.placeholder.com/500x750/333333/ffffff?text=No+Image';
    }
    return `${this.IMAGE_BASE_URL.replace('w500', size)}${path}`;
  }

  // Mendapatkan tahun dari tanggal rilis
  getReleaseYear(date: string): number {
    if (!date) return 0;
    return new Date(date).getFullYear();
  }

  // Format rating
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  // Check if API key is valid
  checkApiConnection(): Observable<boolean> {
    const params = new HttpParams().set('api_key', this.API_KEY);

    return this.http.get(`${this.API_BASE_URL}/configuration`, { params })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Error handler dengan fallback ke sample data
  private handleError(error: HttpErrorResponse): Observable<MovieResponse> {
    console.error('API Error:', error);

    let errorMessage = 'Terjadi kesalahan saat mengambil data film.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'API key tidak valid. Silakan periksa konfigurasi.';
          break;
        case 404:
          errorMessage = 'Data tidak ditemukan.';
          break;
        case 429:
          errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah. Silakan coba lagi.';
          break;
        default:
          errorMessage = `Server mengembalikan kode: ${error.status}`;
      }
    }

    // Fallback ke sample data
    console.log('Menggunakan sample data sebagai fallback...');
    const fallbackResponse: MovieResponse = {
      page: 1,
      results: this.sampleMovies,
      total_pages: 1,
      total_results: this.sampleMovies.length
    };

    return of(fallbackResponse);
  }
}
