var express = require('express');
var router = express.Router();
var conn = require('../connect');
var firstimage = require('../firstImage');

// GET: Trang chủ
router.get('/', function(req, res){
	var sql = 'SELECT * FROM chude ORDER BY TenChuDe; \
	SELECT b.*, c.TenChuDe, t.HoVaTen \
	FROM baiviet b, chude c, taikhoan t \
	WHERE b.MaChuDe = c.ID AND b.MaNguoiDung = t.ID  AND b.KiemDuyet = 1\
	ORDER BY NgayDang DESC';
	conn.query(sql, function(error, results){
		if(error) {
			res.send('/error');
		} else {
			res.render('index', {
				title: 'Trang chủ',
				chude: results[0],
				baiviet: results[1],
				firstImage: firstimage
			});
		}
	});
});

// GET: Xem bài viết
router.get('/baiviet/chitiet/:id', function(req, res){
	var id = req.params.id;
	var sql = 'SELECT b.*, c.TenChuDe, t.HoVaTen \
			FROM baiviet b, chude c, taikhoan t \
			WHERE b.MaChuDe = c.ID AND b.MaNguoiDung = t.ID  AND b.KiemDuyet = 1 AND b.ID = ?\
			ORDER BY NgayDang DESC';
	conn.query(sql, [id], function(error, results){
		if(error) {
			req.session.error = error;
			res.redirect('/error');
		} else {
			res.render('baiviet_chitiet', {
				baiviet: results.shift()
			});
		}
	});
});

// GET: Tin mới nhất


// POST: Kết quả tìm kiếm
router.post('/timkiem', function(req, res){
	res.render('timkiem', { title: 'Kết quả tìm kiếm' });
});


// GET: Lỗi
router.get('/error', function(req, res){
	res.render('error', { title: 'Lỗi' });
});

// GET: Thành công
router.get('/success', function(req, res){
	res.render('success', { title: 'Hoàn thành' });
});

module.exports = router;