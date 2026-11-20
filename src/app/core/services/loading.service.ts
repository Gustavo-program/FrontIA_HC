import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _loading = signal<boolean>(false);
  private count = 0;

  readonly loading = this._loading.asReadonly();

  show(): void {
    this.count++;
    this._loading.set(true);
  }

  hide(): void {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this._loading.set(false);
    }
  }
}
