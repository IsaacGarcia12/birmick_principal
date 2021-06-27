import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Studio } from '../models/studio'
import { GLOBAL } from './global';//Archivo de configuración global
import { UserService } from './user.service';

@Injectable()
export class FormService {

  constructor( private http:Http, private _userService:UserService) { }

  getForm( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'form/getForm/' + _id , { headers } )
    .map(res => res.json());
  }

  getStepForms( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'form/getStepForms/' + _id , { headers } )
    .map(res => res.json());
  }

  getAnswersList( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'form/getAnswersList/' + _id , { headers } )
    .map(res => res.json());
  }

  getAnswers( _id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.get(GLOBAL.url + 'form/getAnswers/' + _id , { headers } )
    .map(res => res.json());
  }

  createForm( formName:string, _id:string){
    let body = {};
    body['name'] = formName;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'form/createForm/' + _id, body, { headers } )
    .map(res => res.json());
  }

  addQuestion( question:object, _id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'form/addQuestion/' + _id, question, { headers } )
    .map(res => res.json());
  }

  removeQuestion( form_id:string , question_id:string){
    let body = {};
    body['questionId'] = question_id;
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.put(GLOBAL.url + 'form/removeQuestion/' + form_id, body, { headers } )
    .map(res => res.json());
  }

  deleteAllFormAnswers( form_id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'form/deleteAllFormAnswers/' + form_id, { headers } )
    .map(res => res.json());
  }

  deleteAnsweredForm( answers_id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'form/deleteAnsweredForm/' + answers_id, { headers } )
    .map(res => res.json());
  }

  deleteForm( form_id:string ){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.delete(GLOBAL.url + 'form/deleteForm/' + form_id, { headers } )
    .map(res => res.json());
  }

  answerForm( answeredForm:object, _id:string){
    let headers = new Headers({
      'Authorization':  this._userService.getToken()
    });
    return this.http.post(GLOBAL.url + 'form/answerForm/' + _id, answeredForm, { headers } )
    .map(res => res.json());
  }

}
