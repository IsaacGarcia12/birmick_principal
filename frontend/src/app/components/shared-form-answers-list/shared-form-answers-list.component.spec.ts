import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedFormAnswersListComponent } from './shared-form-answers-list.component';

describe('SharedFormAnswersListComponent', () => {
  let component: SharedFormAnswersListComponent;
  let fixture: ComponentFixture<SharedFormAnswersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedFormAnswersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedFormAnswersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
