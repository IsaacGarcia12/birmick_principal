import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  @ViewChild('updatePatientResponseModal') updatePatientResponseModal: ModalComponent;


  userForm:FormGroup;
  id:string;
  user:any;
  updatePatientMessage:string;
  updatePatientError:string;

  sexos:string[] = ["masculino", "femenino"]

  constructor(private _userService: UserService,
              private router:Router,
              private route:ActivatedRoute) {
                this.route.params
                    .subscribe( params => {
                      this.id = params.id;
                      // console.log(params.id);
                      this._userService.getUser( this.id )
                      .subscribe(
                        res => {
                          this.user = res;
                          // console.log(res);
                          this.userForm = new FormGroup({
                          //Validators.required: Angular exige que se llene el campo
                            //new FormGroup (Valor por defecto, validadores, validadores asíncronos)

                            'name': new FormControl( res.name, [
                                                            Validators.required
                                                          ]),
                            'username': new FormControl( {value:res.username, disabled: true}, [
                                                            Validators.required
                                                          ]),
                            'asurname' : new FormControl(res.asurname, [
                                                            Validators.required
                                                          ]),
                            'msurname' : new FormControl(res.msurname, [
                                                            Validators.required
                                                          ]),
                            'email' : new FormControl({value: res.email, disabled: true}, [
                                                            Validators.required,
                                                            Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$"),
                                                          ]),
                            'role': new FormControl(res.role, [
                                                            Validators.required
                                                          ])
                          });
                        },
                        err => {
                          // console.log(err);
                        }
                      )

                    });
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  onSubmit(){
    // console.log(this.userForm.value);
    this._userService.update(this.userForm.value, this.user._id)
    .subscribe(
      res => {
        // console.log(res);
        this.updatePatientMessage = this.user.name +" "+this.user.asurname+" "+this.user.msurname+" "+"actualizado correctamente"
        this.updatePatientResponseModal.show();
        setTimeout((()=>{
          this.updatePatientResponseModal.show();
          this.updatePatientResponseModal.hide();
          this.router.navigate( ['./users'] );
        }),1500)
        //this.router.navigate( ['./users'] );
      },
      err => {
        // console.log(err);
        this.updatePatientError = "Error al actualizar a "+this.user.name +" "+this.user.asurname+" "+this.user.msurname7
        this.updatePatientResponseModal.show();
      }
    )
  }

}
