module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/signin');
        }
        next();
    },

    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            return res.redirect('back');//返回之前的页面
        }
        next();
    },

    checkAdmin:function  checkAdmin(req,res,next) {
        if (!req.session.user.role=='a'&&!req.session.user.role=='s'){
            req.flash('error','非管理员登录');//设置error的值
            return res.redirect('back');//返回之前页面
        }
        next();
    },
    checkNotAdmin: function checkNotAdmin(req, res, next) {
        if (req.session.user.role=='a'||req.session.user.role=='s') {
            req.flash('error', '管理员登录');
            return res.redirect('back');//返回之前的页面
        }
        next();
    },
    checkNotSuperAdmin: function checkNotSuperAdmin(req, res, next) {
        if (req.session.user.role=='s') {
            req.flash('error', '超级管理员登录');
            return res.redirect('back');//返回之前的页面
        }
        next();
    },

    checkSuperAdmin:function  checkSuperAdmin(req,res,next) {
        if (!req.session.user.role=='s'){
            req.flash('error','非超级管理员登录');//设置error的值
            return res.redirect('back');//返回之前页面
        }
        next();
    }



};