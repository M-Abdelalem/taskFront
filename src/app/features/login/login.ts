import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/models/api-error';
import { AuthService } from '../../core/services/auth.service';
import { ErrorAlertComponent } from '../../shared/error-alert';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ErrorAlertComponent],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal(
    this.route.snapshot.queryParamMap.has('sessionExpired')
      ? 'Your session expired. Sign in to continue.'
      : '',
  );
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.auth.isAuthenticated()) void this.router.navigate(['/countries']);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/countries']),
        error: (error) => this.error.set(apiErrorMessage(error, 'Unable to sign in.')),
      });
  }
}
