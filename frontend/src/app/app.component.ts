import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PictureSharingMenuOptionComponent } from './picture-sharing/picture-sharing-menu-option/picture-sharing-menu-option.component';
import { slideIn } from '../animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PictureSharingMenuOptionComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideIn]
})
export class AppComponent {
  title = 'Elizabeth Bello and Keith Bush\'s Wedding Website';

  router = inject(Router)

  menuBarExtra?: 'add-picture'
  navMenu = false

  ngOnInit() {
    this.router.events.subscribe(() => {
      if (this.router.url === '/pictures') {
        this.menuBarExtra = 'add-picture'
      }
    })
  }
}
