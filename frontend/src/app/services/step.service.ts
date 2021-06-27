import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Studio } from '../models/studio'
import { GLOBAL } from './global';//Archivo de configuración global
import { UserService } from './user.service';

@Injectable()
export class StepService {

  constructor( private http:Http, private _userService:UserService) {

  }

  createStep(step:any, _id:string){
    let body = step;
    body.studioId = _id;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'step/createStep', body,{ headers } )
    .map(res => res.json());
  }

  updateStep(step:any, _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'step/updateStep/' + _id, step,{ headers } )
    .map(res => res.json());
  }

  getStep(_id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'step/getStep/' + _id, { headers } )
    .map(res => res.json());
  }

  getStepsList ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'step/getStepsList/' + _id, { headers } )
    .map(res => res.json());
  }

  deleteStep ( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'step/deleteStep/' + _id, { headers } )
    .map(res => res.json());
  }

  validateStepNumber ( studioId:string, stepNumber:number ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'step/validateStepNumber/' + studioId + '/' + stepNumber, { headers } )
    .map(res => res.json());
  }

}
