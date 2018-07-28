

var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);
exports.User = mongolass.model('User', {
    name: { type: 'string' },
    password: { type: 'string' },
    avatar: { type: 'string' },
    gender: { type: 'string', enum: ['m', 'f', 'x'] },
    bio: { type: 'string' },
    role:{type:'string',enum:['a','u','s']}
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一


exports.Category = mongolass.model('Category', {
    name: { type: 'string' }
});
exports.Category.index({ name: 1 }, { unique: true }).exec();// 根据分类名名找到分类，分类名全局唯一

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});
exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId ,ref:'User'},
  
    title: { type: 'string' },
    slug:{type:'string' },
    content: { type: 'string'},
    pv: { type: 'number'  },
    published:{type:'Boolean'},
    created:{type:'Date'}
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.Comment=mongolass.model('Comment',{
    author:{type:Mongolass.Types.ObjectId},
    content:{type:'string'},
    postId:{type:Mongolass.Types.ObjectId}
  
});
exports.Comment.index({postId:1,_id:1}).exec();//通过文章id获得该文章下的所有留言，按留言创建时间升序
exports.Comment.index({author:1,_id:1}).exec();//通过用户id和留言   id删除一个留言


