import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { PicturePreviewComponent } from './picture-preview/picture-preview.component';
import { ResizeService } from '../../resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule, PicturePreviewComponent],
  templateUrl: './marquee.component.html',
  styleUrl: './marquee.component.scss',
})
export class MarqueeComponent {
  readonly ON_SCREEN_COUNT = 5
  @ViewChild('previewContainer', { static: true })
  previewContainerRef!: ElementRef<HTMLDivElement>

  @Input()
  pics: {src: string}[] = []

  resizeService = inject(ResizeService)
  
  onScreen: {src: string, translation: number, scale: number, pictureIndex: number}[] = []
  screenWidth = 0

  previewIndex = 0
  currentPicture?: CurrentPictureData
  positionMarkers: {translation: number, scale: number}[] = []

  scrollToInterval?: NodeJS.Timeout

  mouseScrollData?: {curX: number, lastDelta?: number}
  mouseMoveEvent = this.onPointerMove.bind(this)
  moveEndEvent = this.onMoveEndEvent.bind(this)

  resizeSubscription?: Subscription

  ngOnInit() {
    this.screenWidth = this.previewContainerRef.nativeElement.clientWidth
    for (let i = 0; i < this.ON_SCREEN_COUNT; i++) {
      this.onScreen.push({
        src: this.pics[i]?.src,
        translation: i * this.screenWidth,
        scale: 1,
        pictureIndex: i
      })
    }
    this.currentPicture = {
      translation: 0,
      pictureIndex: 0,
      containerIndex: 0
    }
    this.resizeSubscription = this.resizeService.resizeSubject.subscribe(() => {
      
    })
    
    this.createPositionMarkers()
  }

  ngOnChanges(changes: SimpleChanges) {
    const picChanges = changes['pics']
    if (picChanges && !picChanges.isFirstChange()) {
      for (const onScreen of this.onScreen) {
        if (onScreen.src === undefined) {
          onScreen.src = this.pics[onScreen.pictureIndex]?.src
        }
      }
      this.createPositionMarkers()
      this.scroll(0)
    }
  }

  onPointerDown(event: PointerEvent) {
    this.mouseScrollData = { curX: event.x };
    this.previewContainerRef.nativeElement.addEventListener('pointermove', this.mouseMoveEvent);
    window.addEventListener('pointerup', this.moveEndEvent);
  }

  onPointerMove(event: PointerEvent) {
    const width = this.previewContainerRef.nativeElement.clientWidth
    if (this.mouseScrollData && this.currentPicture != undefined) {
      let delta = this.getValidDelta(event.x - this.mouseScrollData.curX, this.currentPicture);
      if (delta) {
        this.scroll(delta);
      }
      this.mouseScrollData.curX = event.x
      this.mouseScrollData.lastDelta = delta
    }
  }

  scrollByCount(event: MouseEvent, count: number) {
    if (this.currentPicture) {
      const newIndex = count + this.currentPicture.pictureIndex;
      if (0 <= newIndex && newIndex < this.pics.length) {
        this.scrollToIndex(newIndex)
      }
    }
    event.stopPropagation()
  }

  scrollByPositionMarker(event: MouseEvent, index: number) {
    this.scrollToIndex(index)
    event.stopPropagation()
  }

  scrollToIndex(index: number) {
    if (this.currentPicture) {
      const speedPerMilli = this.screenWidth / 200
      let speed = speedPerMilli * 20
      if (index === this.currentPicture.pictureIndex) {
        if (this.currentPicture.translation > 0) {
          speed = -speed
        }
      } else {
        if (index > this.currentPicture.pictureIndex) {
          speed = -speed
        }
      }
      if (this.scrollToInterval) {
        clearTimeout(this.scrollToInterval)
      }
      this.scrollToInterval = setInterval(() => {
        if (this.currentPicture) {
          if (this.currentPicture.pictureIndex === index) {
            if (this.currentPicture.translation === 0) {
              clearTimeout(this.scrollToInterval)
              this.scrollToInterval = undefined
            } else {
              const delta = this.getValidDelta(speed, this.currentPicture, index, index)
              this.scroll(delta)
            }
          } else {
            this.scroll(speed)
          }
        }
      }, 20)
    }
  }

  private getValidDelta(delta: number, currentPicture: CurrentPictureData, minIndex = 0, maxIndex?: number) {
    if (!maxIndex) {
      maxIndex = this.pics.length - 1
    }
    if (currentPicture.pictureIndex === minIndex) {
      if (delta > 0) {
        if (currentPicture.translation < 0) {
          let dif = currentPicture.translation + delta;
          if (dif > 0) {
            delta = -currentPicture.translation;
          }
        } else {
          delta = 0;
        }
      }
    } 
    if (currentPicture.pictureIndex === maxIndex) {
      if (delta < 0) {
        if (currentPicture.translation > 0) {
          let dif = currentPicture.translation + delta;
          if (dif < 0) {
            delta = -currentPicture.translation;
          }
        } else {
          delta = 0
        }
      }
    }
    return delta;
  }

  private scroll(delta: number) {
    
    for (const pic of this.onScreen) {
      pic.translation += delta;
      pic.scale = 1 - Math.abs(0.075 * ((Math.abs(pic.translation)) / this.screenWidth));
      if (pic.scale < 0.925) {
        pic.scale = 0.925;
      }
      if (pic.translation < -(this.ON_SCREEN_COUNT / 2) * this.screenWidth) {
        const newIndex = pic.pictureIndex + this.ON_SCREEN_COUNT;
        if (newIndex < this.pics.length) {
          pic.translation += this.ON_SCREEN_COUNT * this.screenWidth;
          pic.pictureIndex = newIndex;
          pic.src = this.pics[pic.pictureIndex].src;
        }
      } else if (pic.translation > (this.ON_SCREEN_COUNT / 2) * this.screenWidth) {
        const newIndex = pic.pictureIndex - this.ON_SCREEN_COUNT;
        if (newIndex >= 0) {
          pic.translation -= this.ON_SCREEN_COUNT * this.screenWidth;
          pic.pictureIndex = newIndex;
          pic.src = this.pics[pic.pictureIndex].src;
        }
      }
    }
    this.setCurrentPicture()
    this.setPositionMarkers()
  }

  setCurrentPicture() {
    let min: CurrentPictureData | undefined = undefined
    for (const [index, onScreen] of this.onScreen.entries()) {
      const positiveTranslation = Math.abs(onScreen.translation);
      if (!min || positiveTranslation < Math.abs(min.translation)) {
        min = {
          translation: onScreen.translation,
          pictureIndex: onScreen.pictureIndex, 
          containerIndex: index
        }
      }
    }
    if (this.currentPicture) {
      if (Math.abs(this.currentPicture.translation) > this.screenWidth * .75) {
        return
      }
    }
    this.currentPicture = min
  }

  onMoveEndEvent(event: PointerEvent) {
    this.previewContainerRef.nativeElement.removeEventListener('pointermove', this.mouseMoveEvent)
    window.removeEventListener('pointerup', this.moveEndEvent)

    if (this.currentPicture && this.mouseScrollData?.lastDelta) {
      if (this.mouseScrollData.lastDelta < -5) {
        console.log('scroll to next')
        if (this.currentPicture.pictureIndex < this.pics.length - 1) {
          this.scrollToIndex(this.currentPicture.pictureIndex + 1)
        }
      } else if (this.mouseScrollData.lastDelta > 5) {
        if (this.currentPicture.pictureIndex != 0) {
          this.scrollToIndex(this.currentPicture.pictureIndex - 1)
        }
      } else {
        this.scrollToIndex(this.currentPicture.pictureIndex)
      }
    }
  }

  setPositionMarkers() {
    if (this.currentPicture != undefined) {
      const picPortion = this.currentPicture.translation / this.screenWidth 
      const scaleDivider = this.ON_SCREEN_COUNT - 2
      for (const [index, marker] of this.positionMarkers.entries()) {
        marker.translation = (picPortion + index - this.currentPicture.pictureIndex) * 100
        marker.scale = 1 - ((1 / scaleDivider) * (Math.abs(marker.translation) / 100))
        if (marker.scale < 0) {
          marker.scale = 0
        }
      }
    }
  }

  createPositionMarkers() {
    this.positionMarkers = []

    for (const pic of this.pics) {
      this.positionMarkers.push({
        translation: 0,
        scale: 0
      })
    }

    this.setPositionMarkers()
  }
}

interface CurrentPictureData { 
  translation: number, 
  pictureIndex: number, 
  containerIndex: number
}