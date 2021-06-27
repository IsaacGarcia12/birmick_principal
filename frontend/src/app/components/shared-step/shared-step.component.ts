import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { ModalComponent }  from "../modal/modal.component";
import { StepService }  from "../../services/step.service";
import { FileService }  from "../../services/file.service";
import { FormService }  from "../../services/form.service";
import { UserService } from '../../services/user.service';
import { saveAs } from 'file-saver';
import 'rxjs/Rx' ;

@Component({
  selector: 'app-shared-step',
  templateUrl: './shared-step.component.html',
  styleUrls: ['./shared-step.component.css']
})
export class SharedStepComponent implements OnInit {

  @ViewChild('downloadingFileModal') downloadingFileModal: ModalComponent;
  @ViewChild('fileDownloadErrorModal') fileDownloadErrorModal: ModalComponent;

  id:string;
  step:any;
  files:any[];
  forms:any[];
  loading:boolean=true;
  fileForm:FormGroup;
  stepForm:FormGroup;
  file:File; /* property of File type */
  downloadFileLoading:boolean = false;
  fileDownloadError:string;

  constructor(private _stepService:StepService,
              private _fileService:FileService,
              private _formService:FormService,
              private _userService:UserService,
              private router:Router,
              private route:ActivatedRoute) {

                this.route.params
                  .subscribe( params => {
                    // console.log( params );
                    this.id=params.id;

                    //Get studio data
                    this._stepService.getStep( params.id )
                    .subscribe( step => {
                      this.step = step;
                      //this.loading=false;
                      // console.log("Step loaded");
                      // console.log(this.step);

                      this._fileService.getStepFiles( params.id )
                      .subscribe( files => {
                        if( files)
                          this.files = files;
                        // console.log("Files loaded");
                        // console.log(this.files);
                      })

                      this._formService.getStepForms( params.id )
                      .subscribe(forms => {
                        if( forms )
                        this.forms = forms;
                        // console.log("Forms loaded")
                        // console.log(this.forms);
                      })
                    })
                    this.loading=false;
                  })


               }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
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

  str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
}
