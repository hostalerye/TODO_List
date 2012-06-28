var express = require('express');
var mongoose = require('mongoose');
var db = require('./config/dbconfig');
var Schema = mongoose.Schema;
//Just to commit
var TaskSchema = new Schema({
  title    : String,
	due_date : Date,
	done : {type:Boolean, default:false}
});

mongoose.connect('mongodb://'+db.user+':'+db.pass+'@'+db.host+':'+db.port+'/'+db.name);

mongoose.model('Task', TaskSchema);

var Task = mongoose.model('Task');

var app = express.createServer();

app.configure(function(){
	app.use(express.logger());
	app.use(express.errorHandler());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
	
});

app.listen('4000');


app.post('/', function(req, res) {
	var task = new Task(req.body.task);
	task.save(function() {
		console.log(task.title);
		console.log(task.due_date);
		console.log(task.done);
		res.redirect('/');
	});
});

app.get('/done/:id', function(req, res) {
	Task.findById(req.params.id, function(err, task) {
		if (!task)
			return next(new Error('Could not find task'));
		else {
			task.done = true;
			task.save(function(err) {
				if (err)
					console.log('error')
				else
					res.redirect('/')
			});
		}
	});
});

app.get('/remove/:id', function(req, res) {
	Task.remove({_id:req.params.id}, function() {
		res.redirect('/')
	});
});

app.get('/', function(req, res) {
	tasks =Task.find({});
	tasks.sort('due_date', 1);
	tasks.exec(function(err, tasks) {
		res.render('tasks', {locals : {
			tasks: tasks
		}});	
	})
});
