import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDynamicFormComponent } from './edit-dynamic-form.component';

describe('EditDynamicFormComponent', () => {
  let component: EditDynamicFormComponent;
  let fixture: ComponentFixture<EditDynamicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDynamicFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
