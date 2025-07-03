import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-picture-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './picture-preview.component.html',
  styleUrl: './picture-preview.component.scss'
})
export class PicturePreviewComponent {
  @Input()
  src?: string

  myElement: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>)

  ngOnInit() {
    this.updateHostStyles();
  }

  private updateHostStyles() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const srcChange: SimpleChange = changes['src']
    if (srcChange && !srcChange.isFirstChange()) {
    }
  }
}
