import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización


  constructor(private _userService: UserService) { }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  loggedIn:boolean = this._userService.CheckLogged();
  username:string = this._userService.getUsername();

}
