import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  template: `
    @if (message) {
      <div class="alert alert-danger alert-dismissible" role="alert" aria-live="assertive">
        <strong>Error:</strong> {{ message }}
        <button type="button" class="btn-close" (click)="dismiss.emit()" aria-label="Dismiss error"></button>
      </div>
    }
  `,
})
export class ErrorAlertComponent {
  @Input() message = '';
  @Output() dismiss = new EventEmitter<void>();
}
