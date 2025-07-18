import { Component, ViewChild } from '@angular/core';
import { MovieListComponent } from './pages/movie-list/movie-list.component';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MovieListComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MovieTube';
  @ViewChild('movieList') movieList!: MovieListComponent;

  onSearch(query: string): void {
    this.movieList.searchMovies(query);
  }

  onLogoClick(): void {
    this.movieList.loadMovies('popular', 'Film Populer');
  }
}
