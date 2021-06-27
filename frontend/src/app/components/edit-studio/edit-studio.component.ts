import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';
import { DatepickerOptions } from 'ng2-datepicker';
import * as esLocale from 'date-fns/locale/es';


@Component({
  selector: 'app-edit-studio',
  templateUrl: './edit-studio.component.html',
  styleUrls: ['./edit-studio.component.css']
})
export class EditStudioComponent implements OnInit {

  studioForm:FormGroup;
  title:string;
  id:string
  studio:any;
  apiResponse:string;
  identity:any;
  options: DatepickerOptions = {
  displayFormat: 'D/MMM/YYYY',
  locale: esLocale
  };

  constructor(private _studioService:StudioService,
              private _userService: UserService,
              private router:Router,
              private route:ActivatedRoute) {
                  this.route.params
                      .subscribe( params => {
                        this.id = params.id;
                        if(this.id !=='new'){
                          this._studioService.getStudio( this.id )
                          .subscribe( studio => {
                            this.studio = studio;
                            // console.log(studio);
                            //this.studioForm.setValue( this.studio );
                            this.title ="Editar Estudio"
                            this.studioForm = new FormGroup({
                              'name': new FormControl(this.studio.name,[
                                                                        Validators.required,
                                                                        Validators.minLength(5)
                                                                      ]),
                              'appliedAt': new FormControl(this.studio.appliedAt,[Validators.required]),
                              'frecSamp': new FormControl(this.studio.frecSamp,[Validators.required,
                                                                                Validators.min(1)
                                                                              ]),
                              'lineaGrab' : new FormControl(this.studio.lineaGrab,[Validators.required]),
                              'numSamp' : new FormControl(this.studio.numSamp,[Validators.required,
                                                                              Validators.min(1)
                                                                              ]),
                              'numSeg' : new FormControl(this.studio.numSeg,[Validators.required,
                                                                            Validators.min(1)
                                                                            ]),
                              'numSteps' : new FormControl(this.studio.numSteps,[Validators.required,
                                                                                Validators.min(1)
                                                                              ]),
                              'tmpoBase' : new FormControl(this.studio.tmpoBase,[Validators.required]),
                              'comments' : new FormControl(this.studio.comments,[]),
                              'privacy': new FormControl(this.studio.privacy,[Validators.required])
                              });
                          },
                          error => console.log(error));
                        }
                        else{
                          this.title = "Nuevo estudio"
                          this.studioForm = new FormGroup({
                            'name': new FormControl(null, [Validators.required, Validators.minLength(5)]),
                            'appliedAt': new FormControl(new Date(),[Validators.required]),
                            'frecSamp': new FormControl(null,[Validators.required,
                                                              Validators.min(1)
                                                            ]),
                            'lineaGrab' : new FormControl(null,[Validators.required]),
                            'numSamp' : new FormControl(null,[Validators.required,
                                                              Validators.min(1)
                                                            ]),
                            'numSeg' : new FormControl(null,[Validators.required,
                                                              Validators.min(1)
                                                            ]),
                            'numSteps' : new FormControl(null,[Validators.required,
                                                                Validators.min(1)
                                                              ]),
                            'tmpoBase' : new FormControl('milisegundos',[Validators.required]),
                            'comments' : new FormControl(null,[]),
                            'privacy': new FormControl('public',[Validators.required])
                            });
                          }
                      })
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    if(!this.identity){
      this.router.navigate(['./login']);
    }
  }

  onSubmit(){
    // console.log(this.studioForm.value);
    if(this.id === "new"){
      //insertando
      this._studioService.createStudio( this.studioForm.value )
      .subscribe(data => {
        this.router.navigate( ['/myStudio', data._id] );
      },
      error =>{
            if(error){
                var body = JSON.parse(error._body);
                this.apiResponse=body.message;
                // console.log(body);
            }
      });
    }
    else{
      //actualizando
      this._studioService.updateStudio( this.studioForm.value, this.id )
      .subscribe(data => {
        this.router.navigate( ['./myStudio', data._id] );
      },
      error => {
        if(error){
          var body = JSON.parse(error._body);
          this.apiResponse=body.message;
          // console.log(body);
        }
      });
    }
  }

}
