# Admin

A simple Angular 20 frontend for the `CountriesCitiesManagement.Api` contract. It includes JWT login, searchable and paginated country/city lists, create/edit/delete flows, country filtering for cities, responsive layouts, and API error feedback.

## Run the app

Requirements: Node.js 20.19+ or Node.js 22.12+ and npm.

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Connect your API

The app calls the exact endpoints in the supplied OpenAPI document. Set the API origin in `public/config.js`:

```js
window.__APP_CONFIG__ = { apiBaseUrl: 'https://localhost:7138' };
```

Use your actual ASP.NET API address. Keep the value empty when the frontend and API are served from the same origin. If they run on different origins, enable CORS for `http://localhost:4200` in the API.

The JWT returned by `POST /api/auth/token` is stored in browser local storage and sent as a Bearer token with later API requests. A `401` response signs the user out and returns them to the login page.

## API features

- `POST /api/auth/token`
- Full create, read, update, and delete flows for `/api/countries`
- Full create, read, update, and delete flows for `/api/cities`
- Search and pagination using `PageNumber`, `PageSize`, and `Search`
- City filtering through `/api/countries/{countryId}/cities`
- Friendly handling of API envelope errors and HTTP/network errors

## Production build

```bash
npm run build
```

The deployable static files are written to `dist/countries-cities-management/browser`.
