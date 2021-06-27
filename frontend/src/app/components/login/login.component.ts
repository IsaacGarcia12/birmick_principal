import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user'
import { Router } from '@angular/router'
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Observable } from 'rxjs/Rx'


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  public user: User;
  public errorMessage;
  loginForm:FormGroup;
  loading:boolean = false;

  constructor(private _UserService: UserService, private router: Router) {
    this.loginForm = new FormGroup({
      //Validators.required: Angular exige que se llene el campo
      //new FormGroup (Valor por defecto, validadores, validadores asíncronos)

      'identifier': new FormControl(null, [
                                      Validators.required
                                      //Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$"),
                                    ]),
      'password' : new FormControl(null, [
                                      Validators.required
                                      //Validators.minLength(6)
                                    ]),
    });
  }

  ngOnInit() {
    this.identity = this._UserService.getIdentity();
    this.token = this._UserService.getToken();
    if(this.identity){
      this.router.navigate(['./home']);
    }
  }

  public onSubmit(){
    this.loading = true;
     //Conseguir los datos del usuario identificado
     this._UserService.signup(this.loginForm.value).subscribe(
       response =>{ //Si no hay error
         //console.log(response);
         let identity = response.user; //Usuario loggeado correctamente
         this.identity = identity;

         if(!this.identity._id){
           alert("El usuario no está correctamente identificado");
         }
         else{
           //Crear elemento en el localstorage para tener al usuario en sesión
           localStorage.setItem('identity', JSON.stringify(identity)); //Se guarda en localstorage el elemento que identifica al usuario

           //Conseguir el token para enviarselo a cada petición http
           this._UserService.signup(this.loginForm.value, 'true').subscribe(
             response =>{ //Si no hay error
               //console.log(response);
               let token = response.token; //Usuario loggeado correctamente
               this.token = token;

               if(this.token.length <= 0){
                 alert("El token no se ha generado");
               }
               else{
                 //Crear elemento en el localstorage para tener el token disponible
                 localStorage.setItem('token',token); //Se guarda en localstorage el elemento del token
                 //this.router.navigate(['./home']);
                 window.location.replace('/home');
                 this.loading = false;
               }
             },
             error => {//Si hay error
               var errorMessage = <any>error;
               if(errorMessage != null){
                 var body = JSON.parse(error._body); //Parsea a JSON la respuesta en caso de ser un error para poder acceder al body y al mensaje de error
                 this.errorMessage=body.message; //Mensaje de error del cuerpo de la respuesta
                 this.loading = false;
                 //console.log(error);
               }
             }
           );
         }
       },
       error => {//Si hay error
         var errorMessage = <any>error;
         if(errorMessage != null){
           var body = JSON.parse(error._body); //Parsea a JSON la respuesta en caso de ser un error para poder acceder al body y al mensaje de error
           this.errorMessage=body.message; //Mensaje de error del cuerpo de la respuesta
           this.loading = false;
           //console.log(error);
         }
       }
     );
   }
}
