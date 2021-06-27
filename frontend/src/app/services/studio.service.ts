import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Studio } from '../models/studio';
import { Router } from '@angular/router'
import { GLOBAL } from './global';//Archivo de configuración global
import { UserService } from './user.service';

@Injectable()
export class StudioService {

  constructor( private http:Http, private _userService:UserService, private router: Router) { }

  createStudio ( studio:any ){
    // let body = JSON.stringify( studio );
    // console.log(body);
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'studio/createStudio', studio, { headers } )
    .map(res => res.json());
  }

  addPatient ( patientId:any, studioId:string ){
    let body = {};
    body['patientId'] = patientId;
    body['studioId'] = studioId;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'studio/addPatient/', body, { headers } )
    .map(res => res.json());
  }

  removePatient ( patientId:any, studioId:string ){
    let body = {};
    body['patientId'] = patientId;
    body['studioId'] = studioId;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'studio/removePatient', body, { headers } )
    .map(res => res.json());
  }

  updateStudio ( studio:any, _id:string ){
    // let body = JSON.stringify( studio );
    // console.log(body);
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'studio/updateStudio/' + _id, studio, { headers } )
    .map(res => res.json());
  }

  deleteStudio (  _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'studio/deleteStudio/' + _id, { headers } )
    .map(res => res.json());
  }

  getAllStudios ( ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/getAllStudios', { headers } )
    .map(res => res.json());
  }

  getAllStudiosListButNotMine(){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/getAllStudiosListButNotMine', { headers } )
    .map(res => res.json());
  }

  searchStudiosByName( keyword:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/searchStudiosByName/'+keyword, { headers } )
    .map(res => res.json());
  }

  getUserStudios ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/getUserStudios/' + _id, { headers } )
    .map(res => res.json());
  }

  getStudio ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/getStudio/' + _id, { headers } )
    .map(res => res.json());
  }

  getStudioByProprietary ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'studio/getStudioByProprietary/' + _id, { headers } )
    .map(res => res.json())
    .catch((error: any) => {
      if (error.status === 401 || error.status === "401" ) {
            // do some thing
            this.router.navigate(['./home']);
      }
      else {
        return Observable.throw(new Error(error.status));
      }
    });
  }

}
