import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Studio } from '../models/studio'
import { GLOBAL } from './global';//Archivo de configuración global
import { UserService } from './user.service';

@Injectable()
export class PatientService {

  constructor( private http:Http, private _userService:UserService) { }

  register( patient:any ,_id:string ){
    let body = patient;
    body.userId = _id;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'patient/register', body, { headers } )
    .map(res => res.json());
  }

  getPatientsNotInTheStudio( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'patient/getPatientsNotInTheStudio/'+_id, { headers } )
    .map(res => res.json());
  }

  update( patient:any ,_id:string ){
    let body = patient;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'patient/update/' + _id, body, { headers } )
    .map(res => res.json());
  }

  getPatient( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'patient/getPatient/' + _id, { headers } )
    .map(res => res.json());
  }

  getPatients( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'patient/getList/' + _id, { headers } )
    .map(res => res.json());
  }

  getPatientsInTheStudio ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'patient/getPatientsInTheStudio/' + _id, { headers } )
    .map(res => res.json());
  }

  deletePatient ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'patient/deletePatient/' + _id, { headers } )
    .map(res => res.json());
  }

}
