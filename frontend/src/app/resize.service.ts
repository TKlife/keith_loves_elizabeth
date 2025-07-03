import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {

  resizeSubject = new ReplaySubject<Event>()

  constructor() { 
    window.addEventListener('resize', (event) => {
      this.resizeSubject.next(event)
    })
  }
}
