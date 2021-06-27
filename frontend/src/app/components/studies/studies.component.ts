import { Component, OnInit, ViewChild } from '@angular/core';
import { StudioService } from '../../services/studio.service';
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/user.service';
import { Studio } from '../../models/studio'
import { ModalComponent }  from "../modal/modal.component";


@Component({
  selector: 'app-studies',
  templateUrl: './studies.component.html',
  styleUrls: ['./studies.component.css']
})
export class StudiesComponent implements OnInit {
  @ViewChild('deleteStudioConfirmationModal') deleteStudioConfirmationModal: ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal: ModalComponent;


  public identity; //Objetos del usuario identificado (loggeado)
  public token;//Token de autorización
  studies:any[] = [];
  loading:boolean=false;
  studioToDelete:string;
  loadingDeleteStudio:boolean=false;
  deleteMessage:string;


  constructor(private _studioService:StudioService,
              private _userService:UserService,
              private router:Router) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();

    this.loading=true;
    this._studioService.getUserStudios(this.identity._id)
    .subscribe(data => {
      //console.log(data);
      this.studies = data;
      this.loading=false;
    },
    err => {
      this.loading=false;
    })
  }

  ngOnInit() {
    if(!this.identity){
      this.router.navigate(['./login']);
    }
  }

  showDeleteStudioModal( id:string ){
    // console.log(id);
    this.studioToDelete = id;
    this.deleteStudioConfirmationModal.show();
  }

  cancelStudioDelete(){
    this.studioToDelete = undefined;
    this.deleteStudioConfirmationModal.hide();
  }

  deleteStudio () {
    if(this.studioToDelete){
      this.loadingDeleteStudio = true;
      this._studioService.deleteStudio( this.studioToDelete )
      .subscribe(
        res => {
          var index = this.studies.findIndex(x => x._id === res.studioId);
          if (index > -1) {
             this.studies.splice(index, 1);
          }
          this.loadingDeleteStudio = false;
          this.deleteMessage = "Estudio eliminado";
          this.deleteStudioConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.loadingDeleteStudio = false;
          this.deleteMessage = body.message;
          this.deleteStudioConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }

}
