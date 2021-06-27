import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Observable } from 'rxjs/Rx'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  public errorMessage;
  public alertRegister;
  public succesRegister;
  signUpForm:FormGroup;
  loading:boolean = false;

  sexos:string[] = ["masculino", "femenino"]

  constructor(private _UserService: UserService, private router: Router) {

    this.signUpForm = new FormGroup({
  //Validators.required: Angular exige que se llene el campo
      //new FormGroup (Valor por defecto, validadores, validadores asíncronos)

      'name': new FormControl( '', [
                                      Validators.required
                                    ]),
      'username': new FormControl( '', [
                                      Validators.required
                                    ]),
      'asurname' : new FormControl('', [
                                      Validators.required
                                    ]),
      'msurname' : new FormControl('', [
                                      Validators.required
                                    ]),
      'gender' : new FormControl('', [
                                      Validators.required
                                    ]),
      'email' : new FormControl('', [
                                      Validators.required,
                                      Validators.pattern("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$"),
                                    ]),
      'password' : new FormControl('', [
                                      Validators.required,
                                      Validators.minLength(6)
                                    ]),
      'password2' : new FormControl(),
    });

  this.signUpForm.controls['password2'].setValidators([
  Validators.required,
  Validators.minLength(6),
  this.passwordNotMatch.bind( this.signUpForm )
])

  }

  ngOnInit() {
    this.identity = this._UserService.getIdentity();
    this.token = this._UserService.getToken();
    if(this.identity){
      this.router.navigate(['./home']);
    }
  }

  passwordNotMatch( control: FormControl ): { [s:string]:boolean }{
    let forma:any = this;
    if( control.value !== forma.controls['password'].value ){
      return {
        passwordNotMatch:true
      }
    }
    return null;
  }

  onSubmit(){
    //console.log(this.signUpForm);
    // console.log(this.signUpForm.value);
    this.loading = true;
    this._UserService.register(this.signUpForm.value).subscribe(
      response => {
        // console.log(response);
        let user = response.userRegistered;

        if(!user._id){
          this.alertRegister = 'Error al registrarse';
        }
        else{
          this.loading = false;
          this.signUpForm.reset({
            username:"",
            name:"",
            asurame:"",
            msurname:"",
            gender:"",
            email:"",
            password:"",
            password2:"",
          });
          this.alertRegister=undefined;
          this.succesRegister = 'Registro realizado correctamente, espere a ser validado para tener acceso total.';
        }
      },
      error => {
        var errorMessage = <any>error;

        if(errorMessage != null){
          var body = JSON.parse(error._body); //Parsea a JSON la respuesta en caso de ser un error para poder acceder al body y al mensaje de error
          this.loading = false;
          this.alertRegister=body.message; //Mensaje de error del cuerpo de la respuesta
          // console.log(error);
        }
      }
    );
  }

}
