var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');

var indexRouter = require('./routes/index');
var taikhoanRouter = require('./routes/taikhoan');
var chudeRouter = require('./routes/chude');
var authRouter = require('./routes/auth');
var baivietRouter = require('./routes/baiviet');
var KhachhangRouter = require('./routes/Khachhang');
var banphimcoRouter = require('./routes/banphimco');
var banphimgiacoRouter=require('./routes/banphimgiaco');
var banphimcustomRouter=require('./routes/banphimcustom');
var banphimgiareRouter=require('./routes/banphimgiare');
var banphimpcRouter=require('./routes/banphimpc');
var banphimvanphongRouter=require('./routes/banphimvanphong');
var BaivietmoiRouter=require('./routes/Baivietmoi');
const { get } = require('express/lib/response');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use(session({
	name: 'iNews',						// Tên session
	secret: 'Black cat eat black mouse',// Khóa bảo vệ
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 30 * 86400000			// 30 * (24 * 60 * 60 * 1000) - Hết hạn sau 30 ngày
	}
}));

app.use(function(req, res, next){
	res.locals.session = req.session;
	
	// Lấy thông báo của trang trước đó (nếu có)
	var error = req.session.error;
	var success = req.session.success;
	
	delete req.session.error;
	delete req.session.success;
	
	res.locals.errorMsg = '';
	res.locals.successMsg = '';
	
	if (error) res.locals.errorMsg = error;
	if (success) res.locals.successMsg = success;
	
	next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/taikhoan', taikhoanRouter);
app.use('/chude', chudeRouter);
app.use('/baiviet', baivietRouter);
app.use('/Khachhang', KhachhangRouter);
app.use('/Khachhang_Chitiet', KhachhangRouter);
app.use('/banphimco', banphimcoRouter);
app.use('/banphimgiaco', banphimgiacoRouter);
app.use('/banphimcustom', banphimcustomRouter);
app.use('/banphimgiare', banphimgiareRouter);
app.use('/banphimpc', banphimpcRouter);
app.use('/banphimvanphong', banphimvanphongRouter);
app.use('/Baivietmoi', BaivietmoiRouter);
app.listen(3000, function(){
	console.log('Server is running!');
});