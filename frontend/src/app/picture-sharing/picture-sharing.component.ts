import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { AlbumComponent } from "./album/album.component";
import { UploadComponent } from "./upload/upload.component";
import { PicturesService } from './pictures.service';

@Component({
  selector: 'app-picture-sharing',
  standalone: true,
  imports: [CommonModule, UploadComponent, AlbumComponent],
  templateUrl: './picture-sharing.component.html',
  styleUrl: './picture-sharing.component.scss'
})
export class PictureSharingComponent {
  picturesService = inject(PicturesService)
  selectedTab: Signal<'upload' | 'gallary'> = computed(() => {
    if (this.picturesService.uploadingPictures()) {
      return 'upload'
    } else {
      return 'gallary'
    }
  })


  ngOnInit() {
  }
}
