import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedStudiosComponent } from './shared-studios.component';

describe('SharedStudiosComponent', () => {
  let component: SharedStudiosComponent;
  let fixture: ComponentFixture<SharedStudiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedStudiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedStudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
