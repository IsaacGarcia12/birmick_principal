import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { FileService }  from "../../services/file.service";
import { FormService }  from "../../services/form.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";
import { saveAs } from 'file-saver';
import 'rxjs/Rx' ;

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html'
})
export class StepComponent implements OnChanges, OnInit {
  @Input() private parentStudio:any;
  @ViewChild('deleteFormConfirmationModal') deleteFormConfirmationModal: ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal: ModalComponent;
  @ViewChild('deleteFileConfirmationModal') deleteFileConfirmationModal: ModalComponent;
  @ViewChild('fileDownloadErrorModal') fileDownloadErrorModal: ModalComponent;
  @ViewChild('downloadingFileModal') downloadingFileModal: ModalComponent;


  id:string;
  studioid:string;
  step:any;
  files:any[] = [];
  forms:any[] = [];
  loading:boolean=true;
  fileUploadLoading:boolean;
  patients:any[] = [];
  fileForm:FormGroup;
  stepForm:FormGroup;
  file:File; /* property of File type */
  formToDelete:string;
  fileToDelete:string;
  deleteMessage:string;
  fileDownloadError:string;
  fileUploadMessage:string;
  failedUploadFile:boolean=false;
  invalidFile:boolean=false;
  downloadFileLoading:boolean = false;

  constructor(private _studiosService:StudioService,
              private _stepService:StepService,
              private _fileService:FileService,
              private _formService:FormService,
              private _userService:UserService,
              private router:Router,
              private _patientService:PatientService,
              private route:ActivatedRoute) {

    this.route.params
      .subscribe( params => {
        // console.log( params );
        this.id=params.stepid;
        this.studioid=params.studioid;

        //Get step data
        this._stepService.getStep( params.stepid )
        .subscribe( step => {
          this.step = step;
          //this.loading=false;
           //console.log("Step loaded");
           //console.log(this.step);

          this._fileService.getStepFilesByPatient( params.stepid )
          .subscribe( files => {
            if( files)
              this.files = files;
            // console.log("Files loaded");
            // console.log(this.files);
          },
          err => {
          //this.loading=false;
          //console.log(err);
        })

          this._formService.getStepForms( params.stepid )
          .subscribe(forms => {
            if( forms )
            this.forms = forms;
            //console.log("Forms loaded")
            //console.log(this.forms);
          },
          err => {
            //this.loading=false;
             //console.log(err);
          })

          this._patientService.getPatientsInTheStudio( this.studioid )
          .subscribe( patients => {
            this.patients = patients;
            // console.log("Patients loaded");
            // console.log(this.patients);
            this.fileForm = new FormGroup({
              //Validators.required: Angular exige que se llene el campo
              //new FormGroup (Valor por defecto, validadores, validadores asíncronos)
              'file': new FormControl(null),
              'patient':new FormControl(this.patients[0]._id)
            });
            this.loading=false;
          },
          err => {
            this.loading=false;
            // console.log(err);
          })
        },
        err => { //Error de cargar etapa
          this.loading=false;
          this.step = undefined;
        })
      })



      this.stepForm = new FormGroup({
        //Validators.required: Angular exige que se llene el campo
        //new FormGroup (Valor por defecto, validadores, validadores asíncronos)
        'formName': new FormControl(null,[Validators.required])
      });
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  ngOnChanges(changes) {
    // When the data is async : get the changes when they are ready

    // // Get @Input data when it's ready
    // if (changes.parentStudio) {
    //    console.log(changes.parentStudio.currentValue);
    // }
  }

  findPatientInArrayById = patient => {
    if(this.fileForm.value.patient)
      return patient._id === this.fileForm.value.patient;
    else
      return null;
  }

  onSubmit(){ //Cargar archivo
    // console.log(this.fileForm.value.patient);
    this.fileUploadMessage = null;
    this.failedUploadFile = false;
    let submitedUser = this.patients.find(this.findPatientInArrayById);
    let _formData = new FormData();
   _formData.append("file", this.file);
   let body = _formData;
   // console.log(body);
   this.fileUploadLoading = true;
   this.fileUploadMessage = "No abandone la página"
   this._fileService.saveFile(body, this.id, this.fileForm.value.patient)
   .subscribe(data => {
      // console.log(data);
      this.fileUploadMessage = "Archivo agregado"
      //Agregar archivo al arreglo de archivos.
      if(this.files){ //Si se recuperaron archivos
        if(submitedUser){
          data.fileStored['patientName'] = submitedUser.name;
          data.fileStored['patientAsurname'] = submitedUser.asurname;
          data.fileStored['patientMsurname'] = submitedUser.msurname;
        }
        this.files.push(data.fileStored);
      }
      else{ //Si no se recuperaron archivos
        if(submitedUser){
          data.fileStored['patientName'] = submitedUser.name;
          data.fileStored['patientAsurname'] = submitedUser.asurname;
          data.fileStored['patientMsurname'] = submitedUser.msurname;
        }
        this.files=[data.fileStored]
      }
      this.fileUploadLoading = false;
    },
    error => {
      // console.log(error);
      var body = JSON.parse(error._body);
      this.fileUploadMessage=body.message;
      this.loading = false;
      this.failedUploadFile = true;
      this.fileUploadLoading = false;
    });
  }

  createForm(){
    // console.log(this.stepForm.value.formName);
    this._formService.createForm(this.stepForm.value.formName, this.id)
    .subscribe(
    res => {
      // console.log(res)
      this.router.navigateByUrl('editDynamicForm/'+res.formStored._id);
    },
    error => {//Si hay error
      var errorMessage = <any>error;
      if(errorMessage != null){
        var body = JSON.parse(error._body); //Parsea a JSON la respuesta en caso de ser un error para poder acceder al body y al mensaje de error
        // console.log(body.message); //Mensaje de error del cuerpo de la respuesta
      }
    })
  }

  downloadFile (fileId: string, fileName: string){
    // console.log(fileId);
    this.downloadFileLoading = true;
    this.downloadingFileModal.show();
    this._fileService.downloadFile( fileId )
    .subscribe( blob  => {
      this.downloadingFileModal.hide();
      this.downloadFileLoading = false;
      saveAs(blob, fileName);
    },
    error => {
      this.downloadingFileModal.hide();
      this.downloadFileLoading = false;
      this.fileDownloadError = 'El archivo no aprobó la prueba de integridad (puede haber sido modificado), su descarga no está permitida.';
      this.fileDownloadErrorModal.show();
    })
  }

  fileChange(files: any){
      // console.log(files);
      // console.log(files[0]);
      //console.log(files[0].nativeElement);
      //console.log(files[0].size);
      if (files[0].size >= 10485760 || files[0].size <= 0){ //Si el archivo excede los 10MB
        this.invalidFile = true;
        this.fileUploadMessage ="Archivo inválido, revise que no exceda los 10MB o que no se encuentre vacío."
      }
      else{
        this.invalidFile = false;
        this.fileUploadMessage = null;
        this.file = files[0];
      }
      //this.file = files[0].nativeElement;
  }

  showDeleteFormModal( id:string ){
    this.formToDelete = id;
    this.deleteFormConfirmationModal.show();
  }

  deleteForm () {
    if(this.formToDelete){
      this._formService.deleteForm( this.formToDelete )
      .subscribe(
        res => {
          var index = this.forms.findIndex(x => x._id === res.deletedForm._id);
          if (index > -1) {
             this.forms.splice(index, 1);
          }
          this.deleteMessage = "Formulario eliminado";
          this.deleteFormConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.deleteMessage = body.message;
          this.deleteFormConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }

  cancelFormDelete(){
    this.formToDelete = undefined;
    this.deleteFormConfirmationModal.hide();
  }

  showDeleteFileModal( id:string ){
    this.fileToDelete = id;
    this.deleteFileConfirmationModal.show();
  }

  cancelFileDelete(){
    this.fileToDelete = undefined;
    this.deleteFileConfirmationModal.hide();
  }

  deleteFile(){
    // console.log(this.fileToDelete);
    if(this.fileToDelete){
      this._fileService.deleteFile( this.fileToDelete )
      .subscribe(
        res => {
          var index = this.files.findIndex(x => x._id === res.deletedFileId);
          // console.log(index);
          if (index > -1) {
             this.files.splice(index, 1);
          }
          this.deleteMessage = "Archivo eliminado";
          this.deleteFileConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.deleteMessage = body.message;
          this.deleteFileConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }
}
