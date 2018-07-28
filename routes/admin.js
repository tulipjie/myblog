var AdminModel= require('../models/users');
var express = require('express');
var router = express.Router();
var User=require('../lib/mongo').User;
var Category=require('../lib/mongo').Category;
var CategoryModel= require('../models/category');

var checkAdmin=require('../middlewares/check').checkAdmin;

router.get('/',function (req,res,next) {
    var author=req.query.author;
   AdminModel.getUsers(author)
        .then(function (users) {
            res.render('admin/admin',{
               users:users
            });
        })
        .catch(next);
});
//GET admin/:author/remove删除用户信息
router.get('/:author/remove',checkAdmin,function (req,res,next) {
    var author = req.params.author;   
    var role=req.session.user.role;
   if(role=='u'){
       req.flash('error','只有管理员才能删除用户');
       return res.redirect('back');//返回之前的页面
   }else if(role=='s'){
        AdminModel.delUserById(author)
            .then(function () {
                req.flash('success', '删除用户成功');
                // 删除成功后跳转到用户管理页面
                res.redirect('/admin/user');
            })
            .catch(next);
    }else if(role=='a'){
        AdminModel.delUserById(author)
            .then(function () {
                req.flash('success', '删除用户成功');
                // 删除成功后跳转到用户管理页面
                res.redirect('/admin/user');
            })
            .catch(next);
    }

});
//后台管理页面
router.get('/',function (req,res) {
    res.render('admin/index',{
        name:req.user.name
    });
});



//用户管理页面
router.get('/user',function (req,res) {
    /*
     * 从数据库中读取用户信息
     * limit(Number)：限制读取的数据条数
     *
     * skip()：忽略数据的条数
     *
     * 每页显示两条
     * 1:1-2 skip0
     * 2:3-4 skip：2
     * */
    var page=Number(req.query.page||1);
    var limit=4;

    var pages=0;
    User.count().then(function (count) {
        //计算总页数 
        pages=Math.ceil(count/limit);
        //限制最高页数
        page=Math.min(page,pages);
        //页数不能小于1
        page=Math.max(page,1);
        var skip=(page-1)*limit;
        User.find().limit(limit).skip(skip).then(function (users) {

            res.render('admin/user_index',{
                users:users,
                page:page,
                pages:pages
            });
        });
    });

});
/*
* 分类首页
* */
router.get('/category',function (req,res) {
    var page=0;
    var pages=0;
    res.render('admin/category',{
        page:page,
        pages:pages
    })

});

/*
* 分类添加
* */
router.get('/category/add',function (req,res) {
    res.render('admin/category_add',{
        
    });
});
/*
* 分类的保存
* */
router.post('/category/add',function (req,res) {
    console.log(req.body)

});
/*router.get('/:author', function(req, res, next) {
    var author = req.params.author; 

    Promise.all([
       AdminModel.getUserById(author)// 获取文章信息
    ])
        .then(function (result) {
            var user= result[0];
            if (!user) {
                throw new Error('该用户不存在');
            }

            res.render('author', {   
                user:user
            });
        })
        .catch(next);;*/

module.exports = router;