import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PicturesService {

  uploadingPictures: WritableSignal<boolean> = signal(false)

  constructor() { }
}
