var User = require('../lib/mongo').User;
var Post = require('../lib/mongo').Post;
var PostModel=require('./posts');

module.exports = {
    // 注册一个用户
    create: function create(user) {
        return User.create(user).exec();
    },

    // 通过用户名获取用户信息
    getUserByName: function getUserByName(name) {
        return User
            .findOne({ name: name })
            .addCreatedAt()
            .exec();
    },
    //获取所有的用户
    getUsers:function  getUsers(author) {
        var query={};
        if(author){
            query.author=author;
        }
        return User
            .find(query)
            .populate({path:'author',model:'User'})
            .sort({_id:-1})
           .exec();
    },
    //删除用户信息
    delUserById:function delUserById(author) {

        return User.remove({_id:author})
            .exec()
            .then(function (res) {
                //文章删除后，再删除文章下的所有留言
                if(res.result.ok&&res.result.n>0){
                    return PostModel.delPostsByAuthor(author);
                }
            });
    }
};