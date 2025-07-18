import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/header/header.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MovieListComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('movieList') movieList!: MovieListComponent;

  onSearch(query: string): void {
    this.movieList.searchMovies(query);
  }

  onLogoClick(): void {
    this.movieList.loadMovies('popular', 'Film Populer');
  }
}
