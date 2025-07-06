import { inject, Injectable } from '@angular/core';
import { AlbumPageInfo, AlbumPictureDto } from './album.models';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PicturesService } from '../pictures.service';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  readonly MAX_PICTURE_COUNT = 60
  http = inject(HttpClient)
}
