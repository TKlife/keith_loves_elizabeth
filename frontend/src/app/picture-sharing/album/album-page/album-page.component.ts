import { Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AlbumPageInfo, AlbumPictureDto } from '../album.models';
import { AlbumService } from '../album.service';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.scss'
})
export class AlbumPageComponent {
  @ViewChild('pageContainer', { static: true })
  pageContainerRef!: ElementRef<HTMLDivElement>

  @Input()
  pageNumber!: number
  @Input()
  pictures: AlbumPictureDto[] = []
  @Input()
  gridParams!: {height: number, width: number, columnCount: number}
  @Input()
  translation: number = 0
  @Input()
  onAfterInit?: (page: AlbumPageComponent) => void
  @Output()
  onClick = new EventEmitter<AlbumPictureDto>()

  albumService = inject(AlbumService)

  afterLoad = new ReplaySubject<{lastImage: string}>(1)

  myElement: ElementRef<HTMLElement> = inject(ElementRef)

  ngOnInit() {
    this.setGrid();
  }

  ngAfterViewInit() {
    if (this.onAfterInit) {
      this.onAfterInit(this)
    }
  }

  private setGrid() {
    this.pageContainerRef.nativeElement.style.gridTemplateColumns = `${this.gridParams.width}px `.repeat(this.gridParams.columnCount)
    this.pageContainerRef.nativeElement.style.gridAutoRows = `${this.gridParams.height}px`
  }

  ngOnChanges(changes: SimpleChanges) {
    
  }
}
