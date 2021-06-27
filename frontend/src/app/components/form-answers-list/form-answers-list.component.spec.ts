import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAnswersListComponent } from './form-answers-list.component';

describe('FormAnswersListComponent', () => {
  let component: FormAnswersListComponent;
  let fixture: ComponentFixture<FormAnswersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAnswersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAnswersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
