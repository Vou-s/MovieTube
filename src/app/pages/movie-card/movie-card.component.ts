import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessedMovie } from '../interfaces/movie.interface';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  @Input() movie!: ProcessedMovie;
  @Output() movieClick = new EventEmitter<ProcessedMovie>();

  posterLoaded = false;

  constructor(public movieService: MovieService) { }

  onMovieClick(): void {
    this.movieClick.emit(this.movie);
  }

  onImageLoad(): void {
    this.posterLoaded = true;
  }

  onImageError(event: any): void {
    this.posterLoaded = false;
    event.target.style.display = 'none';
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/300x450?text=No+Poster';
  }
}
