import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureSharingMenuOptionComponent } from './picture-sharing-menu-option.component';

describe('PictureSharingMenuOptionComponent', () => {
  let component: PictureSharingMenuOptionComponent;
  let fixture: ComponentFixture<PictureSharingMenuOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictureSharingMenuOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PictureSharingMenuOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
