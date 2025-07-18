import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @Output() logoClick = new EventEmitter<void>();

  searchControl = new FormControl('');

  constructor() {
    // Auto search saat mengetik dengan debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && value.trim()) {
        this.searchQuery.emit(value.trim());
      }
    });
  }

  onSearch(): void {
    const query = this.searchControl.value;
    if (query && query.trim()) {
      this.searchQuery.emit(query.trim());
    }
  }

  onLogoClick(): void {
    this.logoClick.emit();
    this.searchControl.setValue('');
  }
}
