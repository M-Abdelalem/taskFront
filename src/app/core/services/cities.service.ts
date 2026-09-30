import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, City, CityRequest, PageQuery, PagedResponse } from '../models/api.models';
import { pageParams } from './countries.service';

@Injectable({ providedIn: 'root' })
export class CitiesService {
  private readonly http = inject(HttpClient);

  list(query: PageQuery, countryId?: number | null) {
    const url = countryId ? `/api/countries/${countryId}/cities` : '/api/cities';
    return this.http.get<ApiResponse<PagedResponse<City>>>(url, { params: pageParams(query) });
  }

  create(request: CityRequest) {
    return this.http.post<ApiResponse<City>>('/api/cities', request);
  }

  update(id: number, request: CityRequest) {
    return this.http.put<ApiResponse<City>>(`/api/cities/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`/api/cities/${id}`);
  }
}
