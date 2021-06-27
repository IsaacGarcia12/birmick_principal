import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateUsersComponent } from './validate-users.component';

describe('ValidateUsersComponent', () => {
  let component: ValidateUsersComponent;
  let fixture: ComponentFixture<ValidateUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidateUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
