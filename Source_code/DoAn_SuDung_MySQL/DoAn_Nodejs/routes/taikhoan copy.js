var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
var conn = require('../connect');
var { check, validationResult } = require('express-validator');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var multer = require('multer');
var storageConfig = multer.diskStorage({
	destination: function(req, file, callback){
		callback(null, 'uploads/');
	},
	filename: function(req, file, callback){
		var timestamp = Date.now();
		callback(null, timestamp + path.extname(file.originalname));
	}
});
var upload = multer({ storage: storageConfig });

// GET: Thêm tài khoản
router.get('/them', function(req, res){
	res.render('taikhoan_them', { title: 'Thêm tài khoản' });
});

// POST: Thêm tài khoản
var validateForm = [
	check('HoVaTen')
		.notEmpty().withMessage('Họ và tên không được bỏ trống.'),
	check('TenDangNhap')
		.notEmpty().withMessage('Tên đăng nhập không được bỏ trống.')
		.isLength({ min: 6 }).withMessage('Tên đăng nhập phải lớn hơn 6 ký tự.'),
	check('MatKhau')
		.notEmpty().withMessage('Mật khẩu không được bỏ trống.')
		.custom((value, { req }) => value === req.body.XacNhanMatKhau).withMessage('Xác nhận mật khẩu không đúng.')
];
router.post('/them', upload.single('HinhAnh'), validateForm, function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		res.render('taikhoan_them', {
			title: 'Thêm tài khoản',
			errors: errors.array()
		});
	} else {
		var fileName = '';
		if(req.file) fileName = req.file.filename;
		var data = {
			HoVaTen: req.body.HoVaTen,
			Email: req.body.Email,
			HinhAnh: fileName,
			TenDangNhap: req.body.TenDangNhap,
			MatKhau: bcrypt.hashSync(req.body.MatKhau, saltRounds)
		};
		var sql = 'INSERT INTO taikhoan SET ?';
		conn.query(sql, data, function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else {
				res.redirect('/taikhoan');
			}
		});
	}
});

// GET: Danh sách tài khoản
router.get('/', function(req, res){
	var sql = "SELECT * FROM taikhoan";
	conn.query(sql, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('taikhoan', {
				title: 'Danh sách tài khoản',
				taikhoan: results
			});
		}
	});
});

// GET: Sửa tài khoản
router.get('/sua/:id', function(req, res){
	var id = req.params.id;
	var sql = 'SELECT * FROM taikhoan WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('taikhoan_sua', {
				title: 'Sửa tài khoản',
				ID: results[0].ID,
				HoVaTen: results[0].HoVaTen,
				Email: results[0].Email,
				HinhAnh: results[0].HinhAnh,
				TenDangNhap: results[0].TenDangNhap,
				MatKhau: results[0].MatKhau,
				QuyenHan: results[0].QuyenHan,
				KichHoat: results[0].KichHoat,
			});
		}
	});
});

// POST: Sửa tài khoản
var validateFormEdit = [
	check('HoVaTen')
		.notEmpty().withMessage('Họ và tên không được bỏ trống.'),
	check('TenDangNhap')
		.notEmpty().withMessage('Tên đăng nhập không được bỏ trống.')
		.isLength({ min: 6 }).withMessage('Tên đăng nhập phải lớn hơn 6 ký tự.'),
	check('MatKhau')
		.custom((value, { req }) => value === req.body.XacNhanMatKhau).withMessage('Xác nhận mật khẩu không đúng.')
];
router.post('/sua/:id', upload.single('HinhAnh'), validateFormEdit, function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		res.render('taikhoan_sua', {
			title: 'Sửa tài khoản',
			ID: req.params.id,
			HoVaTen: req.body.HoVaTen,
			Email: req.body.Email,
			HinhAnh: req.body.HinhAnh,
			TenDangNhap: req.body.TenDangNhap,
			MatKhau: req.body.MatKhau,
			QuyenHan: req.body.QuyenHan,
			KichHoat: req.body.KichHoat,
			errors: errors.array()
		});
	} else {
		var taikhoan = {
			HoVaTen: req.body.HoVaTen,
			Email: req.body.Email,
			TenDangNhap: req.body.TenDangNhap,
			QuyenHan: req.body.QuyenHan,
			KichHoat: req.body.KichHoat
		};
		if(req.body.MatKhau)
			taikhoan['MatKhau'] = bcrypt.hashSync(req.body.MatKhau, saltRounds);
		if(req.file){
			taikhoan['HinhAnh'] = req.file.filename;
		}
		var id = req.params.id;
		var sql = 'UPDATE taikhoan SET ? WHERE ID = ?';
		conn.query(sql, [taikhoan, id], function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else {
				res.redirect('/taikhoan');
			}
		});
	}
});

// GET: Xóa tài khoản
router.get('/xoa/:id', function(req, res){
	var id = req.params.id;
	var sql = 'DELETE FROM taikhoan WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('/taikhoan');
		}
	});
});

module.exports = router;