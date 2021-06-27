import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { APP_ROUTING } from './app.routes';
import { NgDatepickerModule } from 'ng2-datepicker';

import { DatePipe } from '@angular/common';

import { UserService } from './services/user.service';
import { StudioService } from './services/studio.service';
import { StepService } from './services/step.service';
import { PatientService } from './services/patient.service';
import { FileService } from './services/file.service';
import { FormService } from './services/form.service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { StudiesComponent } from './components/studies/studies.component';
import { StudioComponent } from './components/studio/studio.component';
import { StepComponent } from './components/step/step.component';
import { EditStudioComponent } from './components/edit-studio/edit-studio.component';
import { EditStepComponent } from './components/edit-step/edit-step.component';
import { EditDynamicFormComponent } from './components/edit-dynamic-form/edit-dynamic-form.component';
import { EditPatientComponent } from './components/edit-patient/edit-patient.component';
import { PatientsComponent } from './components/patients/patients.component';
import { ModalComponent } from './components/modal/modal.component';
import { AnswerFormComponent } from './components/answer-form/answer-form.component';
import { SharedStudiosComponent } from './components/shared-studios/shared-studios.component';
import { SharedStudioComponent } from './components/shared-studio/shared-studio.component';
import { SharedStepComponent } from './components/shared-step/shared-step.component';
import { ValidateUsersComponent } from './components/validate-users/validate-users.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { FormAnswersListComponent } from './components/form-answers-list/form-answers-list.component';
import { SharedFormAnswersListComponent } from './components/shared-form-answers-list/shared-form-answers-list.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    StudiesComponent,
    StudioComponent,
    StepComponent,
    EditStudioComponent,
    EditStepComponent,
    EditDynamicFormComponent,
    EditPatientComponent,
    PatientsComponent,
    ModalComponent,
    AnswerFormComponent,
    SharedStudiosComponent,
    SharedStudioComponent,
    SharedStepComponent,
    ValidateUsersComponent,
    UsersListComponent,
    EditUserComponent,
    FormAnswersListComponent,
    SharedFormAnswersListComponent
  ],
  imports: [
    BrowserModule,
    APP_ROUTING,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    NgDatepickerModule
  ],
  providers: [
              UserService,
              StudioService,
              StepService,
              PatientService,
              FileService,
              FormService,
              DatePipe
            ],
  bootstrap: [AppComponent]
})
export class AppModule { }
