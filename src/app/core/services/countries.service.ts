import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Country, CountryRequest, PageQuery, PagedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http = inject(HttpClient);

  list(query: PageQuery) {
    return this.http.get<ApiResponse<PagedResponse<Country>>>('/api/countries', {
      params: pageParams(query),
    });
  }

  create(request: CountryRequest) {
    return this.http.post<ApiResponse<Country>>('/api/countries', request);
  }

  update(id: number, request: CountryRequest) {
    return this.http.put<ApiResponse<Country>>(`/api/countries/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`/api/countries/${id}`);
  }
}

export function pageParams(query: PageQuery): HttpParams {
  let params = new HttpParams()
    .set('PageNumber', query.pageNumber)
    .set('PageSize', query.pageSize);

  if (query.search?.trim()) params = params.set('Search', query.search.trim());
  return params;
}
