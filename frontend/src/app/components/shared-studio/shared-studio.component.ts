import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { UserService } from '../../services/user.service';
import { StepService }  from "../../services/step.service";
import { PatientService }  from "../../services/patient.service";
import { ModalComponent }  from "../modal/modal.component";


@Component({
  selector: 'app-shared-studio',
  templateUrl: './shared-studio.component.html',
  styleUrls: ['./shared-studio.component.css']
})
export class SharedStudioComponent implements OnInit {
  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización

  loading:boolean=false;
  studio:any;
  steps:any;
  id:string;

  constructor(private _studiosService:StudioService,
              private _stepService:StepService,
              private _userService:UserService,
              private _patientService:PatientService,
              private router:Router,
              private route:ActivatedRoute) {

    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();

    this.route.params
      .subscribe( params => {
        // console.log(params);
        this.id = params.id;
        this.loading = true;
        //console.log( params );

        //Get studio data
        this._studiosService.getStudio( params.id )
        .subscribe( studio => {
          this.studio = studio;
          //Get studio Steps
          this._stepService.getStepsList( params.id )
          .subscribe( steps => {
            this.steps = steps;
            // console.log("Steps loaded");
            // console.log(this.steps);
          })
          this.loading = false;
        });
      });
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

}
