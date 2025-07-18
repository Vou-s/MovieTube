import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { ProcessedMovie, MovieCategory } from '../interfaces/movie.interface';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnInit {
  movies: ProcessedMovie[] = [];
  isLoading = false;
  errorMessage = '';
  loadingMessage = 'Memuat film...';
  sectionTitle = 'Film Populer';
  activeCategory = 'popular';
  totalResults = 0;
  lastSearchQuery = '';
  showApiStatus = true;
  apiStatus = { message: 'Menghubungkan ke OMDB API...', class: 'offline' };

  categories: MovieCategory[] = [
    { id: 'popular', name: 'Populer', searchTerm: 'popular' },
    { id: 'top_rated', name: 'Rating Tinggi', searchTerm: 'top_rated' },
    { id: 'action', name: 'Action', searchTerm: 'action' },
    { id: 'comedy', name: 'Comedy', searchTerm: 'comedy' },
    { id: 'drama', name: 'Drama', searchTerm: 'drama' },
    { id: 'thriller', name: 'Thriller', searchTerm: 'thriller' }
  ];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.checkApiConnection();
    this.loadMovies('popular', 'Film Populer');
  }

  checkApiConnection(): void {
    this.movieService.checkApiConnection().subscribe({
      next: (isConnected) => {
        if (isConnected) {
          this.apiStatus = { message: '🟢 Terhubung ke OMDB API', class: 'online' };
        } else {
          this.apiStatus = { message: '🟡 Mode Offline - Menggunakan Data Sample', class: 'offline' };
        }
        setTimeout(() => {
          this.showApiStatus = false;
        }, 3000);
      },
      error: () => {
        this.apiStatus = { message: '🔴 Tidak dapat terhubung ke API', class: 'error' };
      }
    });
  }

  loadMovies(categoryId: string, title: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.activeCategory = categoryId;
    this.sectionTitle = title;
    this.lastSearchQuery = '';
    this.loadingMessage = 'Memuat film terbaru...';

    this.movieService.getMoviesByCategory(categoryId).subscribe({
      next: (response) => {
        this.movies = response.movies;
        this.totalResults = response.totalResults;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.handleError('Gagal memuat film dari server');
      }
    });
  }

  loadTrending(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.activeCategory = 'trending';
    this.sectionTitle = '🔥 Film Trending';
    this.lastSearchQuery = '';
    this.loadingMessage = 'Memuat film trending...';

    this.movieService.getTrendingMovies().subscribe({
      next: (response) => {
        this.movies = response.movies;
        this.totalResults = response.totalResults;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trending movies:', error);
        this.handleError('Gagal memuat film trending');
      }
    });
  }

  searchMovies(query: string): void {
    if (!query.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.sectionTitle = `🔍 Hasil Pencarian: "${query}"`;
    this.activeCategory = '';
    this.lastSearchQuery = query;
    this.loadingMessage = 'Mencari film...';

    this.movieService.searchMovies(query).subscribe({
      next: (response) => {
        this.movies = response.movies;
        this.totalResults = response.totalResults;
        this.isLoading = false;

        if (response.movies.length === 0) {
          this.sectionTitle = `Tidak ada hasil untuk "${query}"`;
        }
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.handleError('Gagal mencari film');
      }
    });
  }

  loadFallbackData(): void {
    this.loadMovies('popular', 'Film Populer (Mode Offline)');
  }

  onMovieClick(movie: ProcessedMovie): void {
    // Format informasi film untuk ditampilkan
    const movieInfo = `
🎬 ${movie.title} (${movie.year})

⭐ Rating IMDB: ${movie.rating > 0 ? movie.rating + '/10' : 'Belum ada rating'}

🎭 Genre: ${movie.genre}

⏱️ Durasi: ${movie.runtime}

🎬 Sutradara: ${movie.director}

🎭 Pemeran: ${movie.actors}

📖 Sinopsis:
${movie.plot}

🆔 IMDB ID: ${movie.id}
    `.trim();

    alert(movieInfo);
  }

  retryLoad(): void {
    this.errorMessage = '';

    if (this.lastSearchQuery) {
      this.searchMovies(this.lastSearchQuery);
    } else if (this.activeCategory === 'trending') {
      this.loadTrending();
    } else if (this.activeCategory) {
      const category = this.categories.find(c => c.id === this.activeCategory);
      this.loadMovies(this.activeCategory, category?.name || 'Film');
    } else {
      this.loadMovies('popular', 'Film Populer');
    }
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  trackByMovieId(index: number, movie: ProcessedMovie): string {
    return movie.id;
  }
}
