import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicturePreviewComponent } from './picture-preview.component';

describe('PicturePreviewComponent', () => {
  let component: PicturePreviewComponent;
  let fixture: ComponentFixture<PicturePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PicturePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PicturePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
