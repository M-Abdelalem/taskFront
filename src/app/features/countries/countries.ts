import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/models/api-error';
import { Country } from '../../core/models/api.models';
import { CountriesService } from '../../core/services/countries.service';
import { ErrorAlertComponent } from '../../shared/error-alert';
import { PaginationComponent } from '../../shared/pagination';

@Component({
  selector: 'app-countries',
  imports: [ReactiveFormsModule, ErrorAlertComponent, PaginationComponent],
  templateUrl: './countries.html',
})
export class CountriesComponent implements OnInit {
  private readonly service = inject(CountriesService);
  private readonly fb = inject(FormBuilder);

  readonly countries = signal<Country[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly modalOpen = signal(false);
  readonly editing = signal<Country | null>(null);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 5;
  search = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(10)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page()): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .list({ pageNumber: page, pageSize: this.pageSize, search: this.search })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.errorMessage || 'Unable to load countries.');
            return;
          }
          this.countries.set(response.data.items || []);
          this.page.set(response.data.pageNumber || page);
          this.totalPages.set(response.data.totalPages || 1);
          this.totalCount.set(response.data.totalCount);
        },
        error: (error) => this.error.set(apiErrorMessage(error, 'Unable to load countries.')),
      });
  }

  searchCountries(): void {
    this.load(1);
  }

  clearSearch(): void {
    this.search = '';
    this.load(1);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', code: '' });
    this.modalOpen.set(true);
  }

  openEdit(country: Country): void {
    this.editing.set(country);
    this.form.reset({ name: country.name || '', code: country.code || '' });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.modalOpen.set(false);
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const editing = this.editing();
    const request = {
      name: this.form.controls.name.value.trim(),
      code: this.form.controls.code.value.trim().toUpperCase(),
    };
    const operation = editing
      ? this.service.update(editing.id, request)
      : this.service.create(request);

    this.saving.set(true);
    this.error.set('');
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(response.errorMessage || 'Unable to save the country.');
          this.modalOpen.set(false);
          return;
        }
        this.modalOpen.set(false);
        this.success.set(editing ? 'Country updated successfully.' : 'Country added successfully.');
        this.load(editing ? this.page() : 1);
      },
      error: (error) => {
        this.modalOpen.set(false);
        this.error.set(apiErrorMessage(error, 'Unable to save the country.'));
      },
    });
  }

  remove(country: Country): void {
    if (!confirm(`Delete ${country.name || 'this country'}? This action cannot be undone.`)) return;

    this.deletingId.set(country.id);
    this.error.set('');
    this.service
      .delete(country.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(response.errorMessage || 'Unable to delete the country.');
            return;
          }
          this.success.set('Country deleted successfully.');
          const targetPage = this.countries().length === 1 && this.page() > 1 ? this.page() - 1 : this.page();
          this.load(targetPage);
        },
        error: (error) => this.error.set(apiErrorMessage(error, 'Unable to delete the country.')),
      });
  }
}
