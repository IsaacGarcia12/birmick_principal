import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { PatientService }  from "../../services/patient.service";
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  @ViewChild('deleteUserConfirmationModal') deleteUserConfirmationModal: ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal: ModalComponent;

users:any[];
identity:any;
userToDelete:string;
loading:boolean=true;
loadingDeleteUser:boolean;
deleteMessage:string;

  constructor(private _studioService:StudioService,
              private _userService: UserService,
              private router:Router,
              private route:ActivatedRoute) {
                this.identity = this._userService.getIdentity();
                this._userService.getUsers()
                .subscribe( users => {
                  this.users = users;
                  this.loading = false;
                  // console.log("Patients loaded");
                  // console.log(users);
                },
                err => {
                  this.loading = false;
              })
  }

  ngOnInit() {
    if(!this.identity){
      this.router.navigate(['./login']);
    }
    if(this.identity['role'] != "ROLE_ADMIN"){
      this.router.navigate(['./home']);
    }
  }

  showDeleteUserModal( id:string ){
    this.userToDelete = id;
    this.deleteUserConfirmationModal.show();
  }

  cancelUserDelete(){
    this.userToDelete = undefined;
    this.deleteUserConfirmationModal.hide();
  }

  deleteUser () {
    if(this.userToDelete){
      this.loadingDeleteUser = true;
      this._userService.delete( this.userToDelete )
      .subscribe(
        res => {
          var index = this.users.findIndex(x => x._id === res.userId);
          if (index > -1) {
             this.users.splice(index, 1);
          }
          this.loadingDeleteUser = false;
          this.deleteMessage = "Usuario eliminado, la información asociada a él es irrecuperable.";
          this.deleteUserConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          // console.log(err);
          var body =  JSON.parse(err._body);
          this.loadingDeleteUser = false;
          this.deleteMessage = body.message;
          this.deleteUserConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }

}
