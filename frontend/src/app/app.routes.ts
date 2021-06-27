
import { RouterModule, Routes } from '@angular/router';
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
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { PatientsComponent } from './components/patients/patients.component';
import { AnswerFormComponent } from './components/answer-form/answer-form.component';
import { SharedStudiosComponent } from './components/shared-studios/shared-studios.component';
import { SharedStudioComponent } from './components/shared-studio/shared-studio.component';
import { SharedStepComponent } from './components/shared-step/shared-step.component';
import { ValidateUsersComponent } from './components/validate-users/validate-users.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { FormAnswersListComponent } from './components/form-answers-list/form-answers-list.component';
import { SharedFormAnswersListComponent } from './components/shared-form-answers-list/shared-form-answers-list.component';


const APP_ROUTES: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'myStudies', component: StudiesComponent },
  { path: 'studies', component: SharedStudiosComponent },
  { path: 'search/:keyword', component: SharedStudiosComponent },
  { path: 'users', component: UsersListComponent },
  { path: 'studio/:id', component: SharedStudioComponent },
  { path: 'step/:id', component: SharedStepComponent },
  { path: 'validateUsers', component: ValidateUsersComponent },
  { path: 'myStudio/:id', component: StudioComponent },
  { path: 'myStep/:studioid/:stepid', component: StepComponent },
  { path: 'editStudio/:id', component: EditStudioComponent },
  { path: 'editStep/:id/:studio', component: EditStepComponent },
  { path: 'editStep/:id', component: EditStepComponent },
  { path: 'editUser/:id', component: EditUserComponent },
  { path: 'editDynamicForm/:id', component: EditDynamicFormComponent },
  { path: 'answerForm/:id', component: AnswerFormComponent },
  { path: 'myFormAnswers/:id', component: FormAnswersListComponent },
  { path: 'formAnswers/:id', component: SharedFormAnswersListComponent },
  { path: 'editPatient/:id', component: EditPatientComponent },
  { path: 'myPatients', component: PatientsComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
