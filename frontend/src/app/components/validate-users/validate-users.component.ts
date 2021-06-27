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
  selector: 'app-validate-users',
  templateUrl: './validate-users.component.html',
  styleUrls: ['./validate-users.component.css']
})
export class ValidateUsersComponent implements OnInit {

  @ViewChild('validateUserResponseModal') validateUserResponseModal: ModalComponent;

  validationForms:FormGroup[] = [];
  validateUserForm:FormGroup;
  title:string;
  notValidatedUsers:any[] =[];
  id:string
  studio:any;
  loading:boolean=true;
  validateUserMessage:string;
  validateUserError:string;
  identity:any;

  constructor(private _studioService:StudioService,
              private _userService: UserService,
              private router:Router,
              private route:ActivatedRoute) {
              this.identity = this._userService.getIdentity();

              // this.validateUserForm = new FormGroup({
              //   'role': new FormControl('ROLE_RESCH')
              // });

              this._userService.notValidated()
              .subscribe( notValidatedUsers => {
                this.notValidatedUsers = notValidatedUsers;
                for(let i =0; i< this.notValidatedUsers.length;i++ ){
                  this.validationForms.push(
                    new FormGroup({
                      'role': new FormControl('ROLE_RESCH')
                    })
                  )
                }
                // console.log("Patients loaded");
                this.loading=false;
                // console.log(notValidatedUsers);
              },
              err =>{
                this.loading=false;
              })

              }

  ngOnInit() {
    if(!this.identity){
      this.router.navigate(['./login']);
    }
    if(this.identity['role'] != "ROLE_ADMIN" && this.identity['role'] != "ROLE_PROJMANAG"){
      this.router.navigate(['./home']);
    }
  }

  validateUser( user:any, index:number ){
    let userid = user._id;
    let role:string;
    let submitedForm = this.validationForms[index];
    // console.log(submitedForm.value);
    this._userService.validateUser( userid, submitedForm.value.role)
    .subscribe( res => {
      // console.log(res);
      if(submitedForm.value.role === 'ROLE_PROJMANAG') role ="líder de proyecto"
      if(submitedForm.value.role === 'ROLE_RESCH') role ="investigador"
      this.validateUserMessage = "Usuario " + user.name + " " +user.asurname +" "+user.msurname+" "+ "validado como "+role;
      //this.notValidatedUsers.splice(user, 1);
      //      this.notPatients.splice( this.notPatients.indexOf(patient), 1 );
      var index = this.notValidatedUsers.findIndex(x => x._id === res.user['_id']);
      if (index > -1) {
         this.notValidatedUsers.splice(index, 1);
      }
      this.validateUserResponseModal.show();
    },
    error => {
      this.validateUserError = "Error al validar a " + user.name + " " +user.asurname +" "+user.msurname;
      this.validateUserResponseModal.show();
      // console.log(error);
    }
  )

  }

}
