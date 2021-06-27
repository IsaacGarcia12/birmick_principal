import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Rx'
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-step',
  templateUrl: './edit-step.component.html',
  styleUrls: ['./edit-step.component.css']
})
export class EditStepComponent implements OnInit {

  stepForm:FormGroup;
  step:any;
  id:string;
  studio_id:string
  title:string;
  apiResponse:string;

  constructor(private _studioService:StudioService,
              private _userService: UserService,
              private _stepService: StepService,
              private router:Router,
              private route:ActivatedRoute) {
                this.route.params
                    .subscribe( params => {
                      // console.log(params);
                      this.id = params.id;
                      this.studio_id = params.studio;
                      if(this.id !=='new'){
                        this._stepService.getStep( this.id )
                        .subscribe( step => {
                          this.step = step;
                          // console.log(step);
                          //this.studioForm.setValue( this.studio );
                          this.title ="Editar Etapa"
                          this.stepForm = new FormGroup({
                            'name': new FormControl(this.step.name,[
                                                                    Validators.required,
                                                                    Validators.minLength(1)
                                                                    ]),
                            'numStep': new FormControl({value: this.step.numStep, disabled: true},[Validators.required,
                                                                          Validators.min(1),
                                                                        ]),
                            'during': new FormControl(this.step.during,[Validators.required,
                                                                        Validators.pattern('([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]')
                                                                    ]),
                            'comments': new FormControl(this.step.comments,[])
                            });
                        },
                        error => console.log(error));
                      }
                      else{
                        this.title = "Nueva Etapa"
                        this.stepForm = new FormGroup({
                          'name': new FormControl(null,[Validators.required]),
                          'numStep': new FormControl(null,[Validators.required,
                                                            Validators.min(1),
                                                          ]),
                          'during': new FormControl(null,[Validators.required,
                                                          Validators.pattern('([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]')
                                                          ]),
                          'comments': new FormControl(null,[])
                          });
                        }
                    });

  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  onSubmit(){
    //console.log(this.stepForm);
    if(this.id === "new"){
      //insertando
      this._stepService.createStep( this.stepForm.value, this.studio_id )
      .subscribe(data => {
        this.router.navigate( ['/myStudio', this.studio_id] );
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
      this._stepService.updateStep( this.stepForm.value, this.id )
      .subscribe(
        data => {
        this.router.navigate( ['/myStep', this.studio_id, this.id] );
      },
      error =>{
            if(error){
                var body = JSON.parse(error._body);
                this.apiResponse=body.message;
                // console.log(error);
            }
      });
    }
  }
}
