import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie, MovieCategory } from '../interfaces/movie.interface';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  isLoading = false;
  errorMessage = '';
  loadingMessage = 'Memuat film...';
  sectionTitle = 'Film Populer';
  activeCategory = 'popular';
  currentPage = 1;
  canLoadMore = false;
  lastSearchQuery = '';
  showApiStatus = true;
  apiStatus = { message: 'Menghubungkan ke API...', class: 'offline' };

  categories: MovieCategory[] = [
    { id: 'popular', name: 'Populer', endpoint: 'popular' },
    { id: 'top_rated', name: 'Rating Tinggi', endpoint: 'top_rated' },
    { id: 'upcoming', name: 'Akan Datang', endpoint: 'upcoming' },
    { id: 'now_playing', name: 'Sedang Tayang', endpoint: 'now_playing' }
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
          this.apiStatus = { message: '🟢 Terhubung ke TMDb API', class: 'online' };
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
    this.currentPage = 1;
    this.lastSearchQuery = '';
    this.loadingMessage = 'Memuat film terbaru...';

    const category = this.categories.find(c => c.id === categoryId);
    const endpoint = category?.endpoint || 'popular';

    this.movieService.getMoviesByCategory(endpoint, this.currentPage).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.canLoadMore = response.page < response.total_pages;
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
    this.sectionTitle = '🔥 Film Trending Minggu Ini';
    this.currentPage = 1;
    this.lastSearchQuery = '';
    this.loadingMessage = 'Memuat film trending...';

    this.movieService.getTrendingMovies('week').subscribe({
      next: (response) => {
        this.movies = response.results;
        this.canLoadMore = response.page < response.total_pages;
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
    this.currentPage = 1;
    this.lastSearchQuery = query;
    this.loadingMessage = 'Mencari film...';

    this.movieService.searchMovies(query, this.currentPage).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.canLoadMore = response.page < response.total_pages;
        this.isLoading = false;

        if (response.results.length === 0) {
          this.sectionTitle = `Tidak ada hasil untuk "${query}"`;
        }
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.handleError('Gagal mencari film');
      }
    });
  }

  loadMoreMovies(): void {
    if (!this.canLoadMore || this.isLoading) return;

    this.isLoading = true;
    this.currentPage++;
    this.loadingMessage = 'Memuat film lainnya...';

    let observable;

    if (this.lastSearchQuery) {
      observable = this.movieService.searchMovies(this.lastSearchQuery, this.currentPage);
    } else if (this.activeCategory === 'trending') {
      observable = this.movieService.getTrendingMovies('week');
    } else {
      const category = this.categories.find(c => c.id === this.activeCategory);
      const endpoint = category?.endpoint || 'popular';
      observable = this.movieService.getMoviesByCategory(endpoint, this.currentPage);
    }

    observable.subscribe({
      next: (response) => {
        this.movies = [...this.movies, ...response.results];
        this.canLoadMore = response.page < response.total_pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading more movies:', error);
        this.currentPage--; // Reset page number
        this.handleError('Gagal memuat film tambahan');
      }
    });
  }

  loadFallbackData(): void {
    // Reset ke data sample
    this.loadMovies('popular', 'Film Populer (Mode Offline)');
  }

  onMovieClick(movie: Movie): void {
    // Format informasi film untuk ditampilkan
    const releaseYear = this.movieService.getReleaseYear(movie.release_date);
    const rating = this.movieService.formatRating(movie.vote_average);

    const movieInfo = `
🎬 ${movie.title} (${releaseYear})

⭐ Rating: ${rating}/10 (${movie.vote_count.toLocaleString()} votes)

📅 Tanggal Rilis: ${new Date(movie.release_date).toLocaleDateString('id-ID')}

📖 Sinopsis:
${movie.overview || 'Tidak ada sinopsis tersedia.'}

🌐 Bahasa: ${movie.original_language.toUpperCase()}
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

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }
}
