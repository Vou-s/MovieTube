import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Movie } from '../interfaces/movie.interface';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-movie-card',
  imports: [CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Output() movieClick = new EventEmitter<Movie>();

  posterLoaded = true;

  constructor(public movieService: MovieService) { }

  onMovieClick(): void {
    this.movieClick.emit(this.movie);
  }

  onImageError(event: any): void {
    this.posterLoaded = false;
    event.target.style.display = 'none';
  }
}
