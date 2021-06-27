import { Component, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { Studio }  from "../../models/studio";
import { StudioService }  from "../../services/studio.service";
import { StepService }  from "../../services/step.service";
import { UserService } from '../../services/user.service';
import { FormService }  from "../../services/form.service";
import { ModalComponent }  from "../modal/modal.component";

@Component({
  selector: 'app-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.css']
})
export class AnswerFormComponent implements OnInit {
  @ViewChild('answerFormResponseModal') answerFormResponseModal: ModalComponent;

  form:any;
  id:string;
  answerForm:FormGroup;
  answerFormResponse:string;
  loading:boolean = true;
  getFormResponse:string;

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
                      this.loading = false;
                      this.form = res.form;
                      // console.log(res.form);
                      this.answerForm = new FormGroup({
                      'answersBy': new FormControl(null, [Validators.required]),
                      'answers': new FormArray([])
                    });

                    for(let i=0; i<this.form.questions.length; i++){
                      (<FormArray>this.answerForm.controls['answers']).push(
                        new FormControl('', Validators.required)
                      )
                    }
                  },
                err => {
                  this.loading = false;
                  this.getFormResponse = "No se ha podido recuperar el formulario.";
                })
                  },
                err => {
                  this.loading = false;
                  this.getFormResponse = "No se ha proporcionado un formulario.";
                });
  }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  submitAnswers(){
    let resolvedForm = {};
    resolvedForm['answersBy'] = this.answerForm.value.answersBy;
    resolvedForm['answers'] = [];
    for(let i=0; i<this.form.questions.length; i++){
      resolvedForm['answers'].push({
        "question": this.form.questions[i].sentence,
        "answer": this.answerForm.value.answers[i]
      });
    }
    // console.log(resolvedForm);
    this._formService.answerForm(resolvedForm, this.id)
    .subscribe(
      res =>{
        // console.log(res);
        this.answerFormResponse = "Respuestas almacenadas correctamente.\n Puede volver a responder el formulario si desea.";
        this.answerFormResponseModal.show();
        this.answerForm.reset();
      },
      err =>{
        // console.log (err);
        this.answerFormResponse = "Error al almacenar als respuestas.\n Intente de nuevo"
      }
    )
  }

}
