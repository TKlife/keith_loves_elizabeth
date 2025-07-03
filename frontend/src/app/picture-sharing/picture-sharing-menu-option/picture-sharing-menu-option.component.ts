import { Component, inject } from '@angular/core';
import { PicturesService } from '../pictures.service';

@Component({
  selector: 'app-picture-sharing-menu-option',
  standalone: true,
  imports: [],
  templateUrl: './picture-sharing-menu-option.component.html',
  styleUrl: './picture-sharing-menu-option.component.scss'
})
export class PictureSharingMenuOptionComponent {
  picturesService = inject(PicturesService)
  
  onUpload() {
    this.picturesService.uploadingPictures.set(true)
  }
}
