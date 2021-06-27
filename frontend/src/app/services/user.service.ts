import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';//Archivo de configuración global

@Injectable()
export class UserService {

  public identity;
  public token;
  public url:string;
  private loggedIn:boolean = true;
  private username:string = "Daniel";

  constructor(private _http:Http) {
    this.url = GLOBAL.url;
  }

  //Método para loggear
  signup(user_to_login, gethash = null){
    if (gethash != null){
      user_to_login.gethash= gethash;
    }
    let json = JSON.stringify(user_to_login);
    let params = json;

    let headers = new Headers({'Content-Type':'application/json'});

    return this._http.post(this.url+'user/login', params, {headers: headers})
    .map( res => res.json());
  }

  register(user_to_register){
    let params = JSON.stringify(user_to_register);
    let headers = new Headers({'Content-Type':'application/json'});

    return this._http.post(this.url+'user/register', params, {headers: headers})
    .map( res => res.json());
  }

  delete(_id:string){
    let headers = new Headers({
      'Authorization':  this.getToken()
    });
    return this._http.delete(this.url+'user/deleteUser/'+_id, {headers: headers})
    .map( res => res.json());
  }

  update(user:any, _id:string){
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });
    return this._http.put(this.url+'user/update/'+_id, user, {headers: headers})
    .map( res => res.json());
  }

  updateUser(user_to_update){
    let params = JSON.stringify(user_to_update);
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });

    return this._http.put(this.url+'update-user/'+user_to_update._id, params, {headers: headers})
    .map( res => res.json());
  }

  getUsers(){
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });

    return this._http.get(this.url+'user/getUsers', {headers: headers})
    .map( res => res.json());
  }

  getUser( _id:string ){
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });

    return this._http.get(this.url+'user/getUser/'+_id, {headers: headers})
    .map( res => res.json());
  }

  notValidated(){
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });

    return this._http.get(this.url+'user/notValidated', {headers: headers})
    .map( res => res.json());
  }

  validateUser(_id:string, role:string){
    let body = {};
    body['role']=role;
    let headers = new Headers({
        'Content-Type':'application/json',
        'Authorization': this.getToken() //Pasa el token al servidor
      });

    return this._http.put(this.url+'user/validate/'+_id, body,{headers: headers})
    .map( res => res.json());
  }

  getIdentity(){//Consulta el localstorage para obtener el objeto identity
    let identity = JSON.parse(localStorage.getItem('identity'));

    if(identity != "undefined"){
      this.identity = identity;
    }
    else{
      this.identity = null;
    }
    return this.identity;
  }

  getToken(){//Consulta el localstorage para obtener el objeto de token
    let token = localStorage.getItem('token');
    if(token != "undefined"){
      this.token = token
    }
    else{
      this.token = null;
    }
    return this.token;
  }

  CheckLogged(){
    return this.loggedIn;
  }

  getUsername():string{
    return this.username;
  }

}
