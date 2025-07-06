import { HttpClient } from '@angular/common/http';
import { Component, ComponentRef, ElementRef, inject, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { MarqueeComponent } from "../marquee/marquee.component";
import { AlbumPictureDto } from './album.models';
import { AlbumPageComponent } from "./album-page/album-page.component";

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [MarqueeComponent, AlbumPageComponent],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {
  readonly MAX_PICTURE_COUNT = 60

  @ViewChild('albumContainer', { static: true })
  albumContainerRef!: ElementRef<HTMLDivElement>
  @ViewChild('pageContainer', { static: true, read: ViewContainerRef })
  pageContainer!: ViewContainerRef

  http = inject(HttpClient)
  pictures: AlbumPictureDto[] = []
  gridParams!: {height: number, width: number, columnCount: number}
  pages: ComponentRef<AlbumPageComponent>[] = []
  mouseScrollData?: {currentPoint: {x: number, y: number}, lastDelta?: number}

  marqueeOpen = false

  pointerMoveEvent = this.onPointerMove.bind(this)
  pointerUpEvent = this.onPointerUp.bind(this)

  scrollInterval?: NodeJS.Timeout

  async ngOnInit() {
    const albumContainer = this.albumContainerRef.nativeElement;
    const columnCount = Math.ceil(albumContainer.clientWidth / 280)

    const width = albumContainer.clientWidth / columnCount
    this.gridParams = {
      width,
      height: width,
      columnCount
    }

    await this.loadPictures()
    const totalPages = this.getTotalPages()
    for (let index = 0; index < 3; index++) {
      if (index > totalPages) {
        break
      }
      const ref = this.pageContainer.createComponent(AlbumPageComponent)
      this.pages.push(ref)
      

      this.setPageNumberAndPictures(ref.instance, index);
      ref.instance.gridParams = this.gridParams
      ref.instance.onClick.subscribe(value => {
        console.log(value)
      })
      
      ref.instance.onAfterInit = (instance) => {
        if (this.pages[index + 1]) {
          const page = this.pages[index + 1].instance
          this.translatePage(page, instance.translation + instance.pageContainerRef.nativeElement.clientHeight)
        }
      }
    }
  }

  private setPageNumberAndPictures(page: AlbumPageComponent, pageNumber: number) {
    const startIndex = pageNumber * this.MAX_PICTURE_COUNT

    page.pageNumber = pageNumber;
    page.pictures = this.pictures.slice(startIndex, startIndex + this.MAX_PICTURE_COUNT);
  }

  async loadPictures() {
    this.pictures = []
    const resp: {url: string, thumbnailPath: string, picturePath: string}[] = await firstValueFrom(
      this.http.get<{url: string, thumbnailPath: string, picturePath: string}[]>(
        `${environment.apiUrl}/pictures`
      )
    )
    
    for (const pic of resp) {
      this.pictures.push({
        thumbnailSrc: `${pic.url}/${pic.thumbnailPath}`,
        src: `url(${pic.url}/${pic.picturePath})`
      })
    }
  }

  onMouseWheel(event: Event) {
    const wheelEvent = event as WheelEvent
    this.scroll(this.getValidDelta(wheelEvent.deltaY))
  }

  onPointerDown(event: PointerEvent) {
    this.mouseScrollData = { currentPoint: {y: event.y, x: event.x } };
    this.albumContainerRef.nativeElement.addEventListener('pointermove', this.pointerMoveEvent)
    window.addEventListener('pointerup', this.pointerUpEvent)

    if (this.scrollInterval != undefined) {
      clearInterval(this.scrollInterval)
    }
  }

  onPointerMove(event: PointerEvent) {
    if (this.mouseScrollData) {
      let delta = this.getValidDelta(event.y - this.mouseScrollData.currentPoint.y);
      if (delta) {
        this.scroll(delta);
      }
      this.mouseScrollData.currentPoint = {x: event.x, y: event.y}
      this.mouseScrollData.lastDelta = delta
    }
  }

  getValidDelta(delta: number) {
    const containerHeight = this.albumContainerRef.nativeElement.clientHeight
    const first = this.pages[0].instance;
    if (this.pages.length === 1 && first.pageContainerRef.nativeElement.clientHeight < containerHeight) {
      return 0
    }

    if (delta < 0) {
      const last = this.pages[this.pages.length - 1].instance
      const totalPages = this.getTotalPages()
      if (last.pageNumber === totalPages) {
        if (last.translation + last.pageContainerRef.nativeElement.clientHeight === containerHeight) {
          delta = 0
        } else {
          if (last.translation + last.pageContainerRef.nativeElement.clientHeight + delta < containerHeight) {
            delta = containerHeight - (last.translation + last.pageContainerRef.nativeElement.clientHeight)
            console.log('adjusted delta bottom')
          }
        }
      }
    } else {
      if (first.pageNumber === 0) {
        if (first.translation === 0) {
          delta = 0
        } else {
          if (first.translation + delta > 0) {
            delta = -first.translation
            console.log('adjusted delta top')
          }
        }
      }
    }
    return delta
  }

  onPointerUp(event: PointerEvent) {
    this.albumContainerRef.nativeElement.removeEventListener('pointermove', this.pointerMoveEvent)
    window.removeEventListener('pointerup', this.pointerUpEvent)
    if (this.mouseScrollData?.lastDelta) {
      const dir = this.mouseScrollData.lastDelta > 0 ? 'up' : 'down'

      let delta = this.mouseScrollData?.lastDelta * 2
      this.scrollInterval = setInterval(() => {
        if (delta) {
          this.scroll(this.getValidDelta(delta))
          if (dir === 'up') {
            delta -= 2
          } else {
            delta += 2
          }
          if (Math.abs(delta) < 2) {
            delta = 0
          }

        }

        if (!delta) {
          this.mouseScrollData = undefined
          clearInterval(this.scrollInterval)
        }
      }, 25)
    }
  }

  scroll(delta: number) {
    const first = this.pages[0].instance
    const last = this.pages[this.pages.length - 1].instance
    const totalPages = this.getTotalPages()
    for (const pageRef of this.pages) {
      const page = pageRef.instance
      this.translatePage(page, page.translation + delta)
      const percentTranslated = page.translation / page.pageContainerRef.nativeElement.clientHeight
      if (delta < 0) {
        if (percentTranslated < -1.5 && last.pageNumber + 1 <= totalPages) {
          console.log('switch my guy')
          this.setPageNumberAndPictures(page, last.pageNumber + 1)
          this.translatePage(page, last.translation + last.pageContainerRef.nativeElement.clientHeight)
          console.log(page.translation, last.translation, last.pageContainerRef.nativeElement.clientHeight)
          this.pages.sort((a, b) => a.instance.translation - b.instance.translation)
        }
      } else {
        if (percentTranslated > 1.5 && first.pageNumber - 1 >= 0) {
          console.log('switch my guy')
          const first = this.pages[0].instance
          this.setPageNumberAndPictures(page, first.pageNumber - 1)
          this.translatePage(page, first.translation - first.pageContainerRef.nativeElement.clientHeight)
          this.pages.sort((a, b) => a.instance.translation - b.instance.translation)
        }
      }
    }
  }

  private getTotalPages() {
    return Math.floor(this.pictures.length / this.MAX_PICTURE_COUNT);
  }

  translatePage(page: AlbumPageComponent, translation: number) {
    page.translation = translation
    page.myElement.nativeElement.style.transform = `translate(0px, ${page.translation}px)`
  }
}
