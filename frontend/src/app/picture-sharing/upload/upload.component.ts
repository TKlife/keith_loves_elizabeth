import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { PictureFile } from '../model/picture-file.model';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';
import { MarqueeComponent } from '../marquee/marquee.component';
import { PicturesService } from '../pictures.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MarqueeComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  http = inject(HttpClient)
  picturesService = inject(PicturesService)

  acceptedTypes = new Set<string>(['image/jpeg', 'image/png'])

  uploadedPics: PictureFile[] = []

  onAddPictures(input: HTMLInputElement) {
    input.click()
  }

  onFiles(input: HTMLInputElement) {
    if (input.files) {
      this.uploadedPics = [...this.uploadedPics]
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i]
        if (this.acceptedTypes.has(file.type)) {
          this.uploadedPics.push({
            src: `url(${URL.createObjectURL(file)})`,
            file: file
          })
        }
      }
    }
  }

  onUpload() {
    const formData: FormData = new FormData()
    for (const pic of this.uploadedPics) {
      formData.append('images', pic.file, pic.file.name)
    }
    const httpCall = this.http.post(`${environment.apiUrl}/pictures/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
        finalize(() => console.log('finalize'))
    )

    httpCall.subscribe(resp => {
      if (resp.type == HttpEventType.UploadProgress && resp.total) {
        const uploadProgress = Math.round(100 * (resp.loaded / resp.total))
      } else if (resp.type === HttpEventType.Response) {
        this.picturesService.uploadingPictures.set(false)
      }
    })
  }

  OnCancelUpload() {
    this.picturesService.uploadingPictures.set(false)
  }
}
