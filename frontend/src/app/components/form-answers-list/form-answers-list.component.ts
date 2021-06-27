import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from '@angular/common';
import { FormService }  from "../../services/form.service";
import { ModalComponent }  from "../modal/modal.component";
import { saveAs } from 'file-saver';
import { UserService } from '../../services/user.service';
//import * as jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
declare var jsPDF: any; // Important

@Component({
  selector: 'app-form-answers-list',
  templateUrl: './form-answers-list.component.html',
  styleUrls: ['./form-answers-list.component.css']
})
export class FormAnswersListComponent implements OnInit {

  @ViewChild('formAnswersModal') formAnswersModal: ModalComponent;
  @ViewChild('answersTable') answersTable:ElementRef;
  @ViewChild('deleteAllAnswersConfirmationModal') deleteAllAnswersConfirmationModal:ModalComponent;
  @ViewChild('deleteResponseModal') deleteResponseModal:ModalComponent;
  @ViewChild('deleteAnswersConfirmationModal') deleteAnswersConfirmationModal:ModalComponent;


  id:string;
  answers:any[] = [];
  currentAnswers;
  deleteAllAnswersMessage:string;
  answersToDeleteId:string;

  constructor(private _formService:FormService,
              private router:Router,
              private _userService:UserService,
              private route:ActivatedRoute,
              private datePipe: DatePipe) {

                this.route.params
                    .subscribe( params => {
                      this.id = params.id;
                      // console.log(params);

                      this._formService.getAnswersList( this.id )
                      .subscribe(
                        res => {
                          if(res.answers.length > 0)
                            this.answers = res.answers;
                          // console.log(res);
                        },
                        err => {
                          // console.log(err);
                        }
                      )
                    }
                  )
    }

  ngOnInit() {
    if(!this._userService.getIdentity()){
      this.router.navigate(['./login']);
    }
  }

  showAnswers( _id:string ){
    // console.log( _id );
    this._formService.getAnswers( _id )
    .subscribe(
      res => {
        // console.log(res.answers);
        this.currentAnswers = res.answers;
        this.formAnswersModal.show();
      },
      err => {
        // console.log(err);
      }
    )
  }

  deleteAnswers( id:string ){
    this.answersToDeleteId = id;
    if(this.answersToDeleteId){
      // console.log(this.answersToDeleteId);
      this.deleteAnswersConfirmationModal.show();
    }
  }

  deleteAnsweredForm(){
    if(this.answersToDeleteId){
      this._formService.deleteAnsweredForm( this.answersToDeleteId )
      .subscribe(
        res => {
          var index = this.answers.findIndex(x => x._id === res.deletedAnsweredForm._id);
          // console.log(index);
          if (index > -1) {
             this.answers.splice(index, 1);
          }
          this.deleteAllAnswersMessage = "Respuestas eliminadas.";
          this.deleteAnswersConfirmationModal.hide();
          this.deleteResponseModal.show();
        },
        err => {
          var body =  JSON.parse(err._body);
          this.deleteAllAnswersMessage = body.message;
          this.deleteAnswersConfirmationModal.hide();
          this.deleteResponseModal.show();
        }
      )
    }
  }

  cancelAnswersDelete(){
    this.answersToDeleteId = undefined;
    this.deleteAnswersConfirmationModal.hide();
  }


  deleteAllFormAnswers() {
    this.deleteAllAnswersConfirmationModal.hide();
    this._formService.deleteAllFormAnswers( this.id )
    .subscribe( res  => {
      this.deleteAllAnswersMessage = res.message;
      this.answers = [];
      this.deleteResponseModal.show();
    },
    err => {
      var body =  JSON.parse(err._body);
      this.deleteAllAnswersMessage = body.message;
      this.deleteResponseModal.show();
    })
  }

  downloadAsXLSX(){
    let name = this.currentAnswers.form_id.name + '_' + this.currentAnswers.answersBy + '_'
                + this.datePipe.transform(new Date(this.currentAnswers.answeredAt), 'MMM-d-yy_h:mm_a');
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.answersTable.nativeElement);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');

    /* save to file */
    const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    saveAs(new Blob([this.s2ab(wbout)]), name + '.xlsx');
  }

  downloadAsPDF() {
    let name = this.currentAnswers.form_id.name + '_' + this.currentAnswers.answersBy + '_'
                + this.datePipe.transform(new Date(this.currentAnswers.answeredAt), 'MMM-d-yy_h:mm_a');
    let pdf = new jsPDF('p', 'pt');
    pdf.text("Respuestas al formulario " + this.currentAnswers.form_id.name, 40, 40);
    let columns = [
      {title: "Pregunta", dataKey: "question"},
      {title: "Respuesta", dataKey: "answer"},
    ];
    pdf.autoTable(columns, this.currentAnswers.answers, {
      theme: 'striped', // 'striped', 'grid' or 'plain'
      headerStyles: {
        fillColor: false,
        textColor: 0
      },
      halign: 'left', // left, center, right
      valign: 'middle', // top, middle, bottom
      margin: {top: 60},
      pageBreak: 'auto',
      tableWidth: 'auto',
      showHeader: 'everyPage',
    });
    pdf.save(name);
}

  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

}
