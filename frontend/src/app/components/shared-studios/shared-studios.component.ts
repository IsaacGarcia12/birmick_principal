import { Component, OnInit } from '@angular/core';
import { StudioService } from '../../services/studio.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from "@angular/router";



@Component({
  selector: 'app-shared-studios',
  templateUrl: './shared-studios.component.html',
  styleUrls: ['./shared-studios.component.css']
})
export class SharedStudiosComponent implements OnInit {

  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización

  studies:any[];
  loading:boolean=false;
  keyword:string;
  title:string;
  notStudiosMessage:string;

  constructor(
    private _studioService:StudioService, private _userService:UserService,
    private router:Router,
    private route:ActivatedRoute) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();

    this.loading = true;
    this.route.params
      .subscribe( params => {
        //console.log( params );
        if(params.keyword){
          this.keyword=params.keyword;
          this.title = "Buscar estudios";
          this._studioService.searchStudiosByName( this.keyword )
          .subscribe(data => {
            this.studies = data;
            this.loading=false;
          },
          error => {
            // console.log(error);
            this.studies = null;
            this.notStudiosMessage = "No se encontraron coincidencias"
            this.loading=false;
          })
        }
      });

    if(!this.keyword || this.keyword === ""){
      this.title = "Explorar estudios";
      this._studioService.getAllStudiosListButNotMine()
      .subscribe(data => {
        this.studies = data;
        this.loading=false;
      },
      error => {
        // console.log(error);
        this.notStudiosMessage = "No hay estudios registrados"
        this.loading=false;
      })
    }
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

}
