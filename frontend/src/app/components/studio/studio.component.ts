import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html'
})
export class StudioComponent implements OnInit {
  @ViewChild('addPatientResponseModal') addPatientResponseModal: ModalComponent;
  @ViewChild('deleteStepConfirmationModal') deleteStepConfirmationModal: ModalComponent;
  @ViewChild('removePatientConfirmationModal') removePatientConfirmationModal: ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal: ModalComponent;


  studioForm:FormGroup;
  studio:any;
  steps:any;
  patients:any[] = [];
  notPatients:any[] = [];
  loading:boolean=false;
  loadingNotPatients:boolean=false;
  id:string;
  addPatientMessage:string;
  addPatientError:string;
  stepToDelete:string;
  patientToRemove:string;
  deleteMessage:string;
  loadingDeleteStep:boolean=false;
  loadingRemovePatient:boolean=false;

  constructor(private _studiosService:StudioService,
              private _stepService:StepService,
              private _patientService:PatientService,
              private _userService:UserService,
              private router:Router,
              private route:ActivatedRoute) {

    this.route.params
      .subscribe( params => {
        this.id = params.id;
        this.loading = true;
        //console.log( params );

        //Get studio data
        this._studiosService.getStudioByProprietary( params.id )
        .subscribe( studio => {
          this.studio = studio;
          //this.loading=false;
          // console.log("Studio loaded");
          // console.log(this.studio);

          //Get studio Steps
          this._stepService.getStepsList( params.id )
          .subscribe( steps => {
            this.steps = steps;
            // console.log("Steps loaded");
            // console.log(this.steps);
          })

          //Get studio Patients
          this._patientService.getPatientsInTheStudio( params.id )
          .subscribe( patients => {
            this.patients = patients;
            // console.log("Patients loaded");
            // console.log(this.patients);
          })
          this.loading=false;
        },
      err =>{
        this.loading=false;
      })
      })
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  getPatientsNotInTheStudio(){
    this.loadingNotPatients = true;
    this._patientService.getPatientsNotInTheStudio( this.id )
    .subscribe( notPatients => {
      // console.log(notPatients);
      this.notPatients = notPatients
      this.loadingNotPatients = false;
    },
    err => {
      this.loadingNotPatients = false;
    })
    }

  addPatient( patient:any ){
    let patientId = patient._id;
    this._studiosService.addPatient( patientId, this.id)
    .subscribe( res => {
      // console.log(res);
      this.notPatients.splice( this.notPatients.indexOf(patient), 1 );
      if(!this.patients){
        this.patients = [];
        this.patients[0] = patient;
      }
      else
        this.patients.push(patient);
      this.addPatientMessage = patient.name + " "+ patient.asurname+ " " + patient.msurname + " agregado al estudio exitosamente";
      this.addPatientResponseModal.show();
    },
    error => {//Si hay error
      var errorMessage = <any>error;
      if(errorMessage != null){
        var body = JSON.parse(error._body); //Parsea a JSON la respuesta en caso de ser un error para poder acceder al body y al mensaje de error
        // console.log(body.message); //Mensaje de error del cuerpo de la respuesta
        this.addPatientError = body.message;
      }
      this.addPatientResponseModal.show();
    })
  }

  showDeleteStepModal( id:string ){
    this.stepToDelete = id;
    this.deleteStepConfirmationModal.show();
  }

  cancelStepDelete(){
    this.stepToDelete = undefined;
    this.deleteStepConfirmationModal.hide();
  }

  deleteStep () {
    if(this.stepToDelete){
      this.loadingDeleteStep = true;
      this._stepService.deleteStep( this.stepToDelete )
      .subscribe(
        res => {
          var index = this.steps.findIndex(x => x._id === res.stepId);
          if (index > -1) {
             this.steps.splice(index, 1);
          }
          this.loadingDeleteStep = false;
          this.deleteMessage = "Etapa eliminada";
          this.deleteStepConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.loadingDeleteStep = false;
          this.deleteMessage = body.message;
          this.deleteStepConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }

  showRemovePatientModal( id:string ){
    this.patientToRemove = id;
    this.removePatientConfirmationModal.show();
  }

  cancelRemovePatient(){
    this.patientToRemove = undefined;
    this.removePatientConfirmationModal.hide();
  }

  removePatient(){
    if(this.patientToRemove){
      this.loadingRemovePatient = true;
      this._studiosService.removePatient( this.patientToRemove, this.id )
      .subscribe(
        res => {
          var index = this.patients.findIndex(x => x._id === res.patientId);
          if (index > -1) {
             this.patients.splice(index, 1);
          }
          this.loadingRemovePatient = false;
          this.deleteMessage = "El paciente ya no está en el estudio";
          this.removePatientConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.loadingRemovePatient = false;
          this.deleteMessage = body.message;
          this.removePatientConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }



}
