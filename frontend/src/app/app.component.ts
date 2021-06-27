import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { GLOBAL } from './services/global'
import { User } from './models/user'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Birmick';
  public user: User;
  public user_register: User; //
  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  public errorMessage;
  public alertRegister;
  public url;

  //Constructor de la clase
  constructor(
    private _UserService:UserService
  ){
    this.url = GLOBAL.url;
  }

  ngOnInit(){
    //Cuando se inicia la aplicación se accede al localstorage para obtener los datos de la sesión utilizando los metodos del servicio
    this.identity = this._UserService.getIdentity();
    this.token = this._UserService.getToken();
  }
}
