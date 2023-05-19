var express = require('express');
var router = express.Router();
var conn = require('../connect');
var path = require('path');
var fs = require("fs");
var firstimage = require('../firstImage');
var { check, validationResult } = require('express-validator');
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
var upload = multer({storage: storageConfig});
// GET: Đăng bài viết
router.get('/them', function(req, res){
	// Lấy chủ đề hiển thị vào form thêm
	var sql = 'SELECT * FROM chude ORDER BY TenChuDe';
	conn.query(sql, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('baiviet_them', {
				title: 'Đăng sản phẩm',
				chude: results
			
				
			});
		}
	});
});

// POST: Đăng bài viết
var validateForm = [
	check('MaChuDe').notEmpty().withMessage('Chủ đề không được bỏ trống.'),
	check('TieuDe').notEmpty().withMessage('Tiêu đề bài viết không được bỏ trống.'),
	check('GiaTien').notEmpty().withMessage('Giá tiền bài viết không được bỏ trống.'),
	check('NoiDung').notEmpty().withMessage('Nội dung bài viết không được bỏ trống.')
];
router.post('/them', upload.single('HinhAnh'), validateForm, function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		// Lấy chủ đề hiển thị vào form thêm
		var sql = 'SELECT * FROM chude ORDER BY TenChuDe';
		conn.query(sql, function(error, results){
			if(error) {
				
				req.session.error = error;
				res.redirect('/error');
			} else {
				
				res.render('baiviet_them', {
					title: 'Đăng sản phẩm',
					chude: results,
					errors: errors.array()
				});
			}
		});
	} else {
		if(req.session.MaNguoiDung) {
			var fileName = '';
			if(req.file) fileName = req.file.filename;
			var data = {
				MaChuDe: req.body.MaChuDe,
				HinhAnh: fileName,
				TieuDe: req.body.TieuDe,
				GiaTien: req.body.GiaTien,
				NoiDung: req.body.NoiDung,
				MaNguoiDung: req.session.MaNguoiDung
			};
			var sql = 'INSERT INTO baiviet SET ?';
			conn.query(sql, data, function(error, results){
				if(error) {
					req.session.error = error;
					res.redirect('/error');
				} else {
					req.session.success = 'Đã đăng sản phẩm thành công và đang chờ kiểm duyệt.';
					res.redirect('/success');
				}
			});
		} else {
			res.redirect('/dangnhap');
		}
	}
});

// GET: Danh sách bài viết
router.get('/', function(req, res){
	var sql = 'SELECT b.*, c.TenChuDe, t.HoVaTen \
			   FROM baiviet b, chude c, taikhoan t \
			   WHERE b.MaChuDe = c.ID AND b.MaNguoiDung = t.ID \
			   ORDER BY NgayDang DESC';
	conn.query(sql, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('baiviet', {
				title: 'Danh sách sản phẩm',
				baiviet: results
			

			});
		}
	});
});

// GET: Danh sách bài viết của tôi
router.get('/cuatoi', function(req, res){
	// Mã người dùng hiện tại
	var id = req.session.MaNguoiDung;
	
	var sql = 'SELECT b.*, c.TenChuDe \
			   FROM baiviet b, chude c \
			   WHERE b.MaChuDe = c.ID AND b.MaNguoiDung = ? \
			   ORDER BY b.NgayDang DESC';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('baiviet_cuatoi', {
				title: 'Sản phẩm đã đăng của tôi',
				baiviet: results
				
			});
		}
	});
});

// GET: Sửa bài viết
router.get('/sua/:id', function(req, res){
	var id = req.params.id;
	var sql = 'SELECT * FROM baiviet WHERE ID = ?;\
			   SELECT * FROM chude ORDER BY TenChuDe';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('baiviet_sua', {
				title: 'Sửa sản phẩm',
				baiviet: results[0].shift(),
				chude: results[1]
			});
		}
	});
});

// POST: Sửa bài viết
router.post('/sua/:id', upload.single('HinhAnh'), validateForm, function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		// Lấy chủ đề và bài viết đang sửa hiển thị vào form
		var sql = 'SELECT * FROM baiviet WHERE ID = ?;\
				   SELECT * FROM chude ORDER BY TenChuDe';
		conn.query(sql, function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else {
				res.render('baiviet_sua', {
					title: 'Sửa sản phẩm',
					baiviet: results[0].shift(),
					chude: results[1],
					errors: errors.array()
				});
			}
		});
	} else {
		var baiviet = {
			MaChuDe: req.body.MaChuDe,
			HinhAnh:req.body.HinhAnh,
			TieuDe: req.body.TieuDe,
			GiaTien: req.body.GiaTien,
			NoiDung: req.body.NoiDung
		};
		if(req.file){
			baiviet['HinhAnh'] = req.file.filename;
		}
		var id = req.params.id;
		var sql = 'UPDATE baiviet SET ? WHERE ID = ?';
		conn.query(sql, [baiviet, id], function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else {
				req.session.success = 'Đã đăng sản phẩm thành công và đang chờ kiểm duyệt.';
				res.redirect('/success');
			}
		});
	}
});

// GET: Duyệt bài viết
router.get('/duyet/:id', function(req, res){
	var id = req.params.id;
	var sql = 'UPDATE baiviet SET KiemDuyet = 1 - KiemDuyet WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('back');
		}
	});
});

// GET: Xóa bài viết
router.get('/xoa/:id', function(req, res){
	var id = req.params.id;
	var sql = 'DELETE FROM baiviet WHERE ID = ?';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('back');
		}
	});
});

module.exports = router;