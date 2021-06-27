import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { StudioService }  from "../../../services/studio.service";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  private searchForm:FormGroup;

  constructor(private _userService: UserService,
            private _studioService:StudioService,
            private router:Router,
            private route:ActivatedRoute) {

              this.searchForm = new FormGroup({
                "keyword": new FormControl("",[])
              })

             }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  logout(){ //Método para cerrar sesion
  localStorage.removeItem('identity');
  localStorage.removeItem('token');
  localStorage.clear();//Elimina el localStorage
  this.identity = null;
  this.token = null;
  //window.location.replace('/home');
}

  submitSearch(){
    let keyword = this.searchForm.value.keyword;
    //console.log(keyword);
    this.router.navigate( ['./search', keyword] );
  }
}
