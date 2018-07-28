var PostModel= require('../models/posts');
var CommentModel = require('../models/comments');
var express = require('express');
var router = express.Router();
var Post=require('../lib/mongo').Post;

var checkLogin = require('../middlewares/check').checkLogin;


// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function(req, res, next) {
    /* Post.find().populate('author').populate('category').exec(function (err,posts) {
        return res.jsonp(posts);
        if(err) return next(err);
        res.render('blog/index',{
            title:'Node Blog Home',
            posts:posts,
            pretty:true,
        });
    });*/
    var author=req.query.author;
    var page=Number(req.query.page||1);
    var limit=5;

    var pages=0;
    Post.count().then(function (count) {
        //计算总页数
        pages=Math.ceil(count/limit);
        //限制最高页数y

        page=Math.min(page,pages);
        //页数不能小于1
        page=Math.max(page,1);
        var skip=(page-1)*limit;
      Post.find().limit(limit).skip(skip).then(function (posts) {
                res.render('posts', {
                    posts: posts,
                    page:page,
                    pages:pages
                });
            })
            .catch(next);
    });
 
});

/// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
    res.render('create');
});

// POST /posts 发表一篇文章
router.post('/', checkLogin, function(req, res, next) {
    var author = req.session.user._id;//定义作者、管理员、文章名、文章内容
    var title = req.fields.title;
    var content = req.fields.content;

    // 校验参数
    try {//如果标题或者内容不存在，抛出错误请填写标题或者请填写内容
        if (!title.length) {
            throw new Error('请填写标题');
        }
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');//返回前一页
    }

    var post = {
        author: author,
        title: title,
        content: content,
        pv: 0
    };

    PostModel.create(post)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            post = result.ops[0];
            req.flash('success', '发表成功');
            // 发表成功后跳转到该文章页
            res.redirect(`/posts/${post._id}`);
        })
        .catch(next);
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function(req, res, next) {
    var postId = req.params.postId;

    Promise.all([
        PostModel.getPostById(postId),// 获取文章信息
        CommentModel.getComments(postId),//获取该文章下所有留言
        PostModel.incPv(postId)// pv 加 1
    ])
        .then(function (result) {
            var post = result[0];//赋予变量post和comments以上面所获取的结果
            var comments = result[1];
            if (!post) {
                throw new Error('该文章不存在');
            }

            res.render('post', {
                post: post,
                comments:comments 
            });
        })
        .catch(next);
});
// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;


    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('该文章不存在');
            }
            if (author.toString() !== post.author._id.toString()) {//限定编辑文章所需要的权限
                throw new Error ('权限不足');
            }
            res.render('edit', {
                post: post
            });
        })
        .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    PostModel.updatePostById(postId, author, { title: title, content: content })
        .then(function () {
            req.flash('success', '编辑文章成功');
            // 编辑成功后跳转到上一页
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var role=req.session.user.role;

    PostModel.delPostById(postId, author,role)
        .then(function () {
            req.flash('success', '删除文章成功');
            // 删除成功后跳转到主页
            res.redirect('/posts');
        })
        .catch(next);
});

router.post('/:postId/comment', checkLogin, function(req, res, next) {
    var author = req.session.user._id;
    var postId = req.params.postId;
    var content = req.fields.content;
    var comment = {
        author: author,
        postId: postId,
        content: content
    };

    CommentModel.create(comment)
        .then(function () {
            req.flash('success', '留言成功');
            // 留言成功后跳转到上一页
            res.redirect('back');
        })
        .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
    var commentId = req.params.commentId;
    var author = req.session.user._id;
    var role=req.session.user.role;

    CommentModel.delCommentById(commentId, author,role)
        .then(function () {
            req.flash('success', '删除留言成功');
            // 删除成功后跳转到上一页
            res.redirect('back');
        })
        .catch(next);
});

module.exports = router;