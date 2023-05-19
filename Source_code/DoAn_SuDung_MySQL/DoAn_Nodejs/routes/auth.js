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

// GET: Đăng ký
router.get('/dangky', function(req, res){
	res.render('dangky', { title: 'Đăng ký tài khoản' });
});

// POST: Đăng ký
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
router.post('/dangky', upload.single('HinhAnh'), validateForm, function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		res.render('dangky', {
			title: 'Đăng ký tài khoản',
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
				req.session.success = 'Đã đăng ký tài khoản thành công.';
				res.redirect('/success');
			}
		});
	}
});

// GET: Đăng nhập
router.get('/dangnhap', function(req, res){
	res.render('dangnhap', { title: 'Đăng nhập' });
});

// POST: Đăng nhập
router.post('/dangnhap', function(req, res){
	if(req.session.MaNguoiDung){
		req.session.error = 'Người dùng đã đăng nhập rồi.';
		res.redirect('/error');
	} else {
		var sql = "SELECT * FROM taikhoan WHERE TenDangNhap = ?";
		conn.query(sql, [req.body.TenDangNhap], function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else if(results.length > 0){
				var tk = results[0];
				if(bcrypt.compareSync(req.body.MatKhau, tk.MatKhau)){
					if(tk.KichHoat == 0){
						req.session.error = 'Người dùng đã bị khóa tài khoản.';
						res.redirect('/error');
					} else {
						// Đăng ký session
						req.session.MaNguoiDung = tk.ID;
						req.session.HoVaTen = tk.HoVaTen;
						req.session.QuyenHan = tk.QuyenHan;
						
						res.redirect('/');
					}
				} else {
					req.session.error = 'Mật khẩu không đúng.';
					res.redirect('/error');
				}
			} else {
				req.session.error = 'Tên đăng nhập không tồn tại.';
				res.redirect('/error');
			}
		});
	}
});

// GET: Đăng xuất
router.get('/dangxuat', function(req, res){
	if(req.session.MaNguoiDung){
		delete req.session.MaNguoiDung;
		delete req.session.HoVaTen;
		delete req.session.QuyenHan;
		
		res.redirect('/');
	} else {
		req.session.error = 'Người dùng chưa đăng nhập.';
		res.redirect('/error');
	}
});


module.exports = router;