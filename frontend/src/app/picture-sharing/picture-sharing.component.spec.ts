import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureSharingComponent } from './picture-sharing.component';

describe('PictureSharingComponent', () => {
  let component: PictureSharingComponent;
  let fixture: ComponentFixture<PictureSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictureSharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PictureSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
