'use strict'

var config = require('../config');
var Form = require('../models/mongodb/form');
var AnsweredForm = require('../models/mongodb/answeredForm');
var Form4j = require('../models/neo4j/form');
var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

function createForm (req, res){
    var stepsId=req.params.id;
    var params = req.body;

   	if(params.name != null){
   		var form = new Form();
   		form.name = params.name;
      form.steps_id = stepsId;
        form.save((err, formStored) => {
        	if(err) res.status(500).send({message: err});
            else{
	            if(!formStored){
	            	res.status(404).send({message: 'No se ha creado el formulario.'});
	            }
	            else{
	            	res.status(200).send({formStored});
	            }
        	}
        });
   	}
   	else{
   		res.status(400).send({message: 'Introduzca un nombre'});
   	}
}

function addQuestion(req, res){
    var formId=req.params.id;
    var params = req.body;

    if(params.sentence != null && params.questionType != null){
      var question = new Object();
      question.questionType = params.questionType;
      question.sentence = params.sentence;

      if(params.questionType === "mult_opc"){
        // if(params.option1 == null || params.option2 == null)
        //  return res.status(400).send({message: 'Rellene todos los datos'});
        // else{
        //  var options = [params.option1, params.option2];
        //  if(params.option3) options.push(params.option3);
        //  if(params.option4) options.push(params.option4);
        //  if(params.option5) options.push(params.option5);

        //  question.options = options;
        // }
        if(params.options[0] == null || params.options[1] == null)
          return res.status(400).send({message: 'Rellene todos los datos'});
        else
          question.options = params.options;
      }

    Form.findByIdAndUpdate( formId, { $push:{questions: question }}, {new: true} ,(err, formUpdated) => {
    if(err){
      res.status(500).send({message: 'Error al agregar la pregunta'});
    }
    else
    {
      if(!formUpdated){
        res.status(404).send({message: 'No se ha podido agregar la pregunta'});
      }
      else
      {
        //Muestra los datos del usuario antes de ser actualizado
        res.status(200).send({formUpdated});
      }
    }
  });
    }
    else{
      res.status(400).send({message: 'Rellene todos los datos'});
    }
}

function removeQuestion(req, res){
    var formId=req.params.id;
    var params = req.body;

    var questionId = params.questionId;

    if(!questionId){
      return res.status(404).send({message: 'Id de la pregunta no provisto'}); 
    }
		Form.findByIdAndUpdate( formId, { $pull: { questions: { _id: questionId } } }, {new: true} ,(err, formUpdated) => {
		if(err){
			res.status(500).send({message: 'Error al eliminar la pregunta'});
		}
		else
		{
			if(!formUpdated){
				res.status(404).send({message: 'No se ha podido eliminar la pregunta'});
			}
			else
			{
				//Muestra los datos del usuario antes de ser actualizado
				res.status(200).send({formUpdated});
			}
		}
	});
}

function getForm (req, res){
    var formId=req.params.id;

      Form.findById(formId).exec((err, form)=>{
      if(err){
        res.status(500).send({message: 'Error en la petición'});
      }
      else{
        if(!form){
          res.status(404).send({message: 'EL formulario no existe'});
        }
        else{
          res.status(200).send({form});
        }
      }
    });
}

function getStepForms (req, res){
  var stepId = req.params.id;
  Form4j.getStepForms(dbUtils.getSession(req), stepId)
  .then( forms => { res.status(200).send(forms); })
  .catch(function (err) {
    //res.status(err.status).send({message: err.username});
    console.log(err);
  }) //Si ocurre un error
}

function answerForm (req, res){
    var answers = req.body;

    if(answers.answersBy != null){
      var answeredForm = new AnsweredForm();

      answeredForm.form_id = req.params.id;
      answeredForm.answersBy = answers.answersBy;
      answeredForm.answers = answers.answers;

        answeredForm.save((err, answerStored) => {
          if(err) res.status(500).send({message: err});
            else{
              if(!answerStored){
                res.status(404).send({message: 'No se han guardado las respuestas.'});
              }
              else{
                res.status(200).send({answerStored});
              }
          }
        });
    }
    else{
      res.status(400).send({message: 'Introduzca un nombre'});
    }
}


//Obtiene la lista de respuestas del formulario
function getAnswersList (req, res){
    var formId = req.params.id;

    var query = AnsweredForm.find({ form_id: formId}).sort({answeredAt: -1}).select({ answersBy: 1, answeredAt: 1 });

    query.exec((err, answers) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
      if(!answers){
        res.status(404).send({message: "No respuestas"});
      }
      else{
        res.status(200).send({answers});
      }
    }
  });
}

//Obtiene un formulario resuelto
function getAnswers (req, res){
    var formId = req.params.id;

   AnsweredForm.findById(formId).populate('form_id', 'name').exec((err, answers) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
      if(!answers){
        res.status(404).send({message: "No respuestas"});
      }
      else{
        res.status(200).send({answers});
      }
    }
  });
}

//Eliminar todas las respuestas del formulario
function deleteAllFormAnswers (req, res){
    var formId = req.params.id;
   AnsweredForm.remove({ form_id: formId}).exec((err) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
        res.status(200).send({message:"Todas las respuestas han sido eliminadas"});
    }
  });
}

//Eliminar un formulario resuelto
function deleteAnsweredForm (req, res){
   var answeredFormId = req.params.id;
   AnsweredForm.findByIdAndRemove(answeredFormId).exec((err, deletedAnsweredForm) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
      if(!deletedAnsweredForm){
        res.status(404).send({message: "Las respuestas no han sido eliminadas"});
      }
      else{
        res.status(200).send({deletedAnsweredForm});
      }
    }
  });
}

//Eliminar un formulario y todas sus respuestas
function deleteForm (req, res){
   var formId = req.params.id;
   Form.findByIdAndRemove(formId).exec((err, deletedForm) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
      if(!deletedForm){
        res.status(404).send({message: "El formulario no ha sido eliminado"});
      }
      else{
          AnsweredForm.remove({ form_id: formId}).exec((err) =>{
            if(err){
              res.status(500).send({message: "Error en la petición"});
            }
            else{
                res.status(200).send({deletedForm});
            }
          });
      }
    }
  });
}

module.exports = {
	createForm,
	addQuestion,
  removeQuestion,
  getForm,
  getStepForms,
  answerForm,
  getAnswersList,
  getAnswers,
  deleteAllFormAnswers,
  deleteAnsweredForm,
  deleteForm
}


