import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/models/api-error';
import { City, Country } from '../../core/models/api.models';
import { CitiesService } from '../../core/services/cities.service';
import { CountriesService } from '../../core/services/countries.service';
import { ErrorAlertComponent } from '../../shared/error-alert';
import { PaginationComponent } from '../../shared/pagination';

@Component({
  selector: 'app-cities',
  imports: [ReactiveFormsModule, ErrorAlertComponent, PaginationComponent],
  templateUrl: './cities.html',
})
export class CitiesComponent implements OnInit {
  private readonly citiesService = inject(CitiesService);
  private readonly countriesService = inject(CountriesService);
  private readonly fb = inject(FormBuilder);

  readonly cities = signal<City[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly modalOpen = signal(false);
  readonly editing = signal<City | null>(null);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 5;
  search = '';
  countryFilter: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    countryId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadCountries();
    this.load();
  }

  loadCountries(): void {
    this.countriesService.list({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (response) => {
        if (response.success && response.data) this.countries.set(response.data.items || []);
      },
      error: (error) => this.error.set(apiErrorMessage(error, 'Unable to load the country list.')),
    });
  }

  load(page = this.page()): void {
    this.loading.set(true);
    this.error.set('');
    this.citiesService
      .list(
        { pageNumber: page, pageSize: this.pageSize, search: this.search },
        this.countryFilter,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.errorMessage || 'Unable to load cities.');
            return;
          }
          this.cities.set(response.data.items || []);
          this.page.set(response.data.pageNumber || page);
          this.totalPages.set(response.data.totalPages || 1);
          this.totalCount.set(response.data.totalCount);
        },
        error: (error) => this.error.set(apiErrorMessage(error, 'Unable to load cities.')),
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  setCountryFilter(value: string): void {
    this.countryFilter = value ? Number(value) : null;
    this.load(1);
  }

  clearSearch(): void {
    this.search = '';
    this.load(1);
  }

  countryName(countryId: number): string {
    return this.countries().find((country) => country.id === countryId)?.name || `Country #${countryId}`;
  }

  countryCode(countryId: number): string {
    return this.countries().find((country) => country.id === countryId)?.code || '—';
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', countryId: this.countryFilter || 0 });
    this.modalOpen.set(true);
  }

  openEdit(city: City): void {
    this.editing.set(city);
    this.form.reset({ name: city.name || '', countryId: city.countryId });
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
      countryId: Number(this.form.controls.countryId.value),
    };
    const operation = editing
      ? this.citiesService.update(editing.id, request)
      : this.citiesService.create(request);

    this.saving.set(true);
    this.error.set('');
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(response.errorMessage || 'Unable to save the city.');
          this.modalOpen.set(false);
          return;
        }
        this.modalOpen.set(false);
        this.success.set(editing ? 'City updated successfully.' : 'City added successfully.');
        this.load(editing ? this.page() : 1);
      },
      error: (error) => {
        this.modalOpen.set(false);
        this.error.set(apiErrorMessage(error, 'Unable to save the city.'));
      },
    });
  }

  remove(city: City): void {
    if (!confirm(`Delete ${city.name || 'this city'}? This action cannot be undone.`)) return;

    this.deletingId.set(city.id);
    this.error.set('');
    this.citiesService
      .delete(city.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(response.errorMessage || 'Unable to delete the city.');
            return;
          }
          this.success.set('City deleted successfully.');
          const targetPage = this.cities().length === 1 && this.page() > 1 ? this.page() - 1 : this.page();
          this.load(targetPage);
        },
        error: (error) => this.error.set(apiErrorMessage(error, 'Unable to delete the city.')),
      });
  }
}
