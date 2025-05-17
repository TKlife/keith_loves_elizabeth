import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PictureSharingComponent } from './picture-sharing/picture-sharing.component';

export const routes: Routes = [
  { path: 'pictures', component: PictureSharingComponent}
];
