import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  @ViewChild('deletePatientConfirmationModal') deletePatientConfirmationModal: ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal: ModalComponent;

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  patients:any[] = [];
  loading:boolean=false;
  patientToDelete:string;
  deleteMessage:string;
  loadingDeletePatient:boolean;

  constructor(private _patientService:PatientService, private _userService:UserService, private router:Router) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();

    this.loading=true;
    this._patientService.getPatients(this.identity._id)
    .subscribe(data => {
      // console.log(data);
      this.patients = data.patients;
      this.loading=false;
    },
    err => {
      this.loading=false;
    }
  )
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }


    showDeletePatientModal( id:string ){
      this.patientToDelete = id;
      this.deletePatientConfirmationModal.show();
    }

    cancelPatientDelete(){
      this.patientToDelete = undefined;
      this.deletePatientConfirmationModal.hide();
    }

    deletePatient () {
      if(this.patientToDelete){
        this.loadingDeletePatient = true;
        this._patientService.deletePatient( this.patientToDelete )
        .subscribe(
          res => {
            var index = this.patients.findIndex(x => x._id === res.deletedPatient);
            if (index > -1) {
               this.patients.splice(index, 1);
            }
            this.loadingDeletePatient = false;
            this.deleteMessage = "Paciente eliminado";
            this.deletePatientConfirmationModal.hide();
            this.deleteResponseModal.show();
          },
          err => {
            var body =  JSON.parse(err._body);
            this.loadingDeletePatient = false;
            this.deleteMessage = body.message;
            this.deletePatientConfirmationModal.hide();
            this.deleteResponseModal.show();
          }
        )
      }
    }

}
