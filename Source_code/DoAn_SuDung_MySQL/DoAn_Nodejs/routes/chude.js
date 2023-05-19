var express = require('express');
var router = express.Router();
var conn = require('../connect');





// GET: Danh sách chủ đề
router.get('/', function(req, res){
	var sql = 'SELECT * FROM chude ORDER BY ID';
	conn.query(sql, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('chude', {
				title: 'Danh sách phân loại sản phẩm bàn phím',
				chude: results
			});
		}
	});
});

// GET: Thêm chủ đề
router.get('/them', function(req, res){	
	res.render('chude_them', { title: 'Thêm chủ đề' });
});

// POST: Thêm chủ đề
router.post('/them', function(req, res){
	var chude = {
		TenChuDe: req.body.TenChuDe
	};
	var sql = "INSERT INTO chude SET ?";
	conn.query(sql, chude, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('/chude');
		}
	});
});

// GET: Sửa chủ đề
router.get('/sua/:id', function(req, res){	
	var id = req.params.id;
	var sql = 'SELECT * FROM chude WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('chude_sua', {
				title: 'Sửa chủ đề',
				chude: results[0]
			});
		}
	});
});

// POST: Sửa chủ đề
router.post('/sua/:id', function(req, res){	
	var chude = {
		TenChuDe: req.body.TenChuDe
	};
	var id = req.params.id;
	var sql = 'UPDATE chude SET ? WHERE ID = ?';
	conn.query(sql, [chude, id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('/chude');
		}
	});
});

// GET: Xóa chủ đề
router.get('/xoa/:id', function(req, res){	
	var id = req.params.id;
	var sql = 'DELETE FROM chude WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('/chude');
		}
	});
});

module.exports = router;