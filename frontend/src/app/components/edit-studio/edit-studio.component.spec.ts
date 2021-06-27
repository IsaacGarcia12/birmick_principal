import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStudioComponent } from './edit-studio.component';

describe('EditStudioComponent', () => {
  let component: EditStudioComponent;
  let fixture: ComponentFixture<EditStudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
