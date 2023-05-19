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
			res.render('banphimcustom', {
				title: 'Bàn phím custom',
				chude: results[0],
				baiviet: results[1],
				firstImage: firstimage
			});
		}
	});
});

module.exports = router;