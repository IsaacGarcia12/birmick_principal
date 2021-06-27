import { Injectable } from '@angular/core';
import { Http, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Studio } from '../models/studio'
import { GLOBAL } from './global';//Archivo de configuración global
import { UserService } from './user.service';

@Injectable()
export class FileService {

  constructor( private http:Http, private _userService:UserService) { }

  downloadFile(_id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    let requestOptions = new RequestOptions({
      headers: headers,
      responseType: ResponseContentType.Blob
    });
    return this.http.get(GLOBAL.url + 'file/downloadFile/' + _id, requestOptions )
    .map(res => { return res.blob(); });
  }

  saveFile(body:any, stepsId:string, patientsId:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'file/saveFile/' + stepsId +"/"+patientsId, body, { headers } )
    .map(res => res.json());
  }

  deleteFile( _id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'file/deleteFile/' + _id, { headers } )
    .map(res => res.json());
  }

  getStepFiles(_id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'file/getStepFilesWithoutPatient/' + _id, { headers } )
    .map(res => res.json());
  }

  getStepFilesByPatient(_id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'file/getStepFilesByPatient/' + _id, { headers } )
    .map(res => res.json());
  }

}
