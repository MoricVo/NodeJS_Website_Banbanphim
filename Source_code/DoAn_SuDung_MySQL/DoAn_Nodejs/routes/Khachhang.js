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




router.get('/', function(req, res){
	var sql = 'SELECT k.*, b.TieuDe \
			   FROM tbl_khachhang k, baiviet b where k.SanPham = b.ID\
			     ';
	conn.query(sql, function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('Khachhang_Chitiet', {
				title: 'Danh sách khách hàng đăng kí mua hàng',
				Khachhang: results
			});
		}
	});
});


router.post('/sua/:MaKhachHang', function(req, res){	
	var Kh = {
		TenKhachHang:req.body.TenKhachHang,
				SoDienThoai:req.body.SoDienThoai,
				Gmail:req.body.Gmail,
				DiaChi:req.body.DiaChi
	};
	var MaKhachHang = req.params.MaKhachHang;
	var sql = 'UPDATE tbl_khachhang SET ? WHERE MaKhachHang = ?';
	conn.query(sql, [Kh, MaKhachHang], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('/Khachhang_Chitiet');
		}
	});
});


router.get('/xoa/:MaKhachHang', function(req, res){
	var MaKhachHang = req.params.MaKhachHang;
	var sql = 'DELETE FROM tbl_khachhang WHERE MaKhachHang = ?';
	conn.query(sql, [MaKhachHang], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.redirect('back');
		}
	});
});


router.get('/mua/:ID', function(req, res){
	res.render('Khachhang_them', { title: 'Đăng ký mua hàng', sanpham:req.params.ID });
	
});

// POST: Đăng ký

router.post('/mua/:ID', function(req, res){
	var errors = validationResult(req);
	if(!errors.isEmpty()) {
		if(req.file) fs.unlink(req.file.path, function(err){});
		res.render('Khachhang_them', {
			title: 'Đăng ký khách hàng',
			errors: errors.array()
		});
	} else {
		var data = {
			    MaKhachHang:req.body.MaKhachHang,
				TenKhachHang:req.body.TenKhachHang,
				SoDienThoai:req.body.SoDienThoai,
				Gmail:req.body.Gmail,
				DiaChi:req.body.DiaChi,
				SoLuong:req.body.SoLuong,
				SanPham: req.body.SanPham

		};
		var sql = 'INSERT INTO tbl_khachhang SET ?';
		conn.query(sql, data, function(error, results){
			if(error) {
				req.session.error = error;
				res.redirect('/error');
			} else {
				req.session.success = 'Đã đăng ký mua thành công.';
				res.redirect('/success');
			}
		});
	}
});

module.exports = router;
