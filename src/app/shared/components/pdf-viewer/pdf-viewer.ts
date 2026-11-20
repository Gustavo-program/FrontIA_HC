import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss'
})
export class PdfViewer implements OnInit, OnChanges {
  @Input() url?: string;
  @Input() blob?: Blob;
  @Input() height = '760px';

  private readonly sanitizer = inject(DomSanitizer);
  safeUrl: SafeResourceUrl | null = null;
  rawUrl: string | null = null;
  loading = false;
  error = false;

  ngOnInit(): void {
    if (this.url || this.blob) {
      this.loadPdf();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] || changes['blob']) {
      this.loadPdf();
    }
  }

  private loadPdf(): void {
    this.loading = true;
    this.error = false;

    try {
      if (this.blob) {
        const objUrl = URL.createObjectURL(this.blob);
        this.rawUrl = objUrl;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objUrl);
        this.loading = false;
      } else if (this.url) {
        this.rawUrl = this.url;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        this.loading = false;
      } else {
        this.safeUrl = null;
        this.rawUrl = null;
        this.loading = false;
      }
    } catch {
      this.error = true;
      this.loading = false;
    }
  }

  openExternal(): void {
    if (this.rawUrl) {
      window.open(this.rawUrl, '_blank');
    }
  }
}
