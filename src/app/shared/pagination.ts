import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 border-top">
      <small class="text-body-secondary">Page {{ page }} of {{ totalPages || 1 }}</small>
      <nav aria-label="Pagination">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="page <= 1">
            <button class="page-link" type="button" [disabled]="page <= 1" (click)="pageChange.emit(page - 1)">Previous</button>
          </li>
          <li class="page-item" [class.disabled]="page >= totalPages">
            <button class="page-link" type="button" [disabled]="page >= totalPages" (click)="pageChange.emit(page + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
}
