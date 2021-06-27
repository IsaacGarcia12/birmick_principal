import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  styleUrls: ['./edit-patient.component.css']
})
export class EditPatientComponent implements OnInit {
  patientForm:FormGroup;
  patient:any;
  id:string;
  title:string;

  sexos:string[] = ["masculino", "femenino"]


  constructor(private _studioService:StudioService,
              private _userService: UserService,
              private _patientService: PatientService,
              private router:Router,
              private route:ActivatedRoute) {

                this.route.params
                    .subscribe( params => {
                      // console.log(params);
                      this.id = params.id;
                      if(this.id !=='new'){
                        this._patientService.getPatient( this.id )
                        .subscribe( response => {
                          this.patient = response.patient;
                          // console.log(this.patient);
                          //this.studioForm.setValue( this.studio );
                          this.title ="Editar Paciente"
                          this.patientForm = new FormGroup({
                            'name': new FormControl(this.patient.name,[Validators.required]),
                            'asurname': new FormControl(this.patient.asurname,[Validators.required]),
                            'msurname': new FormControl(this.patient.msurname,[Validators.required]),
                            'age': new FormControl(this.patient.age,[Validators.required,
                                                                      Validators.min(0),
                                                                      Validators.max(99)]),
                            'gender': new FormControl(this.patient.gender,[Validators.required]),
                            'weight': new FormControl(this.patient.weight,[Validators.required,
                                                                          Validators.min(0),
                                                                          Validators.max(300)]),
                            'height': new FormControl(this.patient.height,[Validators.required,
                                                                          Validators.min(0),
                                                                          Validators.max(3.5)]),
                            'mainActivity': new FormControl(this.patient.mainActivity,[])
                            });
                        },
                        error => console.log(error));
                      }
                      else{
                        this.title = "Nuevo Paciente"
                        this.patientForm = new FormGroup({
                          'name': new FormControl(null,[Validators.required]),
                          'asurname': new FormControl(null,[Validators.required]),
                          'msurname': new FormControl(null,[Validators.required]),
                          'age': new FormControl(null,[Validators.required,
                                                      Validators.min(0),
                                                      Validators.max(99)]),
                          'gender': new FormControl(null,[Validators.required]),
                          'weight': new FormControl(null,[Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(300)]),
                          'height': new FormControl(null,[Validators.required,
                                                        Validators.min(0),
                                                        Validators.max(3.5)]),
                          'mainActivity': new FormControl(null,[])
                          });
                        }
                    }); }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  onSubmit(){
    if(this.id === "new"){
      //insertando
      this._patientService.register( this.patientForm.value, this._userService.getIdentity()._id )
      .subscribe(data => {
        this.router.navigate( ['/myPatients'] );
      },
      error => console.log(error));
    }
    else{
      //actualizando
      this._patientService.update( this.patientForm.value, this.id )
      .subscribe(data => {
        this.router.navigate( ['./myPatients'] );
      },
      error => console.log(error));
    }
  }

}
