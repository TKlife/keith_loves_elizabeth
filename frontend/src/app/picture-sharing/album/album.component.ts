import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { MarqueeComponent } from "../marquee/marquee.component";

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [MarqueeComponent],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {
  @ViewChild('albumContainer', { static: true })
  albumContainerRef!: ElementRef<HTMLDivElement>

  columnCount = 2

  http = inject(HttpClient)
  pictures: {thumbnailSrc: string, src: string}[] = []
  pictureDims!: {height: number, width: number}

  marqueeOpen = false

  ngOnInit() {
    this.getPictures()
    const albumContainer = this.albumContainerRef.nativeElement;
    this.columnCount = Math.ceil(albumContainer.clientWidth / 280)

    const width = albumContainer.clientWidth / this.columnCount
    this.pictureDims = {
      width,
      height: width
    }
    this.albumContainerRef.nativeElement.style.gridTemplateColumns = `${width}px `.repeat(this.columnCount)
    this.albumContainerRef.nativeElement.style.gridAutoRows = `${width}px`
  }

  async getPictures() {
    const resp: {url: string, thumbnailPath: string, picturePath: string}[] = await firstValueFrom(
      this.http.get<{url: string, thumbnailPath: string, picturePath: string}[]>(`${environment.apiUrl}/pictures/thumbnails`)
    )
    this.pictures = []
    for (const pic of resp) {
      this.pictures.push({
        thumbnailSrc: `${pic.url}/${pic.thumbnailPath}`,
        src: `url(${pic.url}/${pic.picturePath})`
      })
    }
  }

  openMarquee() {

  }
}
