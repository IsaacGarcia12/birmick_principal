import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { FormService }  from "../../services/form.service";
import { UserService } from '../../services/user.service';
import { ModalComponent }  from "../modal/modal.component";

@Component({
  selector: 'app-edit-dynamic-form',
  templateUrl: './edit-dynamic-form.component.html',
  styleUrls: ['./edit-dynamic-form.component.css']
})
export class EditDynamicFormComponent implements OnInit {
  @ViewChild('newQuestionModal') newQuestionModal: ModalComponent;
  @ViewChild('newQuestiontResponseModal') newQuestiontResponseModal: ModalComponent;
  @ViewChild('deleteQuestionConfirmationModal') deleteQuestionConfirmationModal: ModalComponent;
  @ViewChild('deleteQuestiontResponseModal') deleteQuestiontResponseModal: ModalComponent;

  form:any;
  questionForm:FormGroup;
  id:string;
  addQuestionMessage:string;
  deleteQuestionMessage:string;
  idToDelete:string;
  loading:boolean=true;
  getFormMessage:string;

  constructor(private _studiosService:StudioService,
              private _stepService:StepService,
              private _formService:FormService,
              private _userService:UserService,
              private router:Router,
              private route:ActivatedRoute) {
                this.route.params
                  .subscribe( params => {
                    this.id = params.id;
                    this._formService.getForm( params.id )
                    .subscribe(res => {
                      this.form = res.form;
                      // console.log(res.form);
                      this.loading=false;
                    },
                    err => {
                      this.loading=false;
                      this.getFormMessage = "No se pudo recuperar el formulario";
                    })
                  });

      this.questionForm = new FormGroup({
      'sentence': new FormControl(null,[Validators.required]),
      'questionType': new FormControl('open_answer',[Validators.required]),
      'options': new FormArray([
        new FormControl( null ),
        new FormControl( null )
      ]),
    });

    this.questionForm.controls['questionType'].valueChanges
    .subscribe( questionType => {
      // console.log(questionType);
      if(questionType === 'open_answer'){
        this.questionForm.controls['options'].disable;
      }
      else {
        this.questionForm.controls['options'].enable;
      }
    })

  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  addAnswerOption(){
    (<FormArray>this.questionForm.controls['options']).push(
      new FormControl( null )
    )
  }

  removeAnswerOption(){
    let optionsSize = <FormArray>this.questionForm.controls['options'].get('length');
    //console.log(+optionsSize);
    (<FormArray>this.questionForm.controls['options']).removeAt( +optionsSize -1 );
  }
  submitQuestion(){
    //console.log(this.questionForm.value);
    let newQuestion = this.questionForm.value;
    if(newQuestion.questionType === "open_answer")
      delete newQuestion.options;
    //console.log(newQuestion);
    this._formService.addQuestion(newQuestion, this.id)
    .subscribe(res => {
      //console.log(res);
      this.newQuestionModal.hide();
      this.form = res.formUpdated;
      this.addQuestionMessage = "Pregunta agregada correctamente";
      this.newQuestiontResponseModal.show();
      this.questionForm.reset({
        sentence: null,
        questionType: 'open_answer',
        options: [null, null]
      });
    },
    error => {
      this.addQuestionMessage = error;
      this.newQuestiontResponseModal.show();
    })
  }

  confirmQuestionDelete( questionId:string ){
    //console.log(questionId);
    this.idToDelete = questionId;
    this.deleteQuestionConfirmationModal.show();
  }

  deleteQuestion (){
    this._formService.removeQuestion(this.id, this.idToDelete)
    .subscribe(
      res => {
        //console.log(res);
        this.deleteQuestionConfirmationModal.hide();
        this.form = res.formUpdated;
        this.deleteQuestionMessage = "Pregunta eliminada correctamente";
        this.deleteQuestiontResponseModal.show();
      },
      err => {
        // console.log(err)
      }
    )
  }



}
