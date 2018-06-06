var express = require('express');
var router = express.Router();
var rating = require(appRoot + '/models/dnr_rating');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var async = require("async");
var ListItems = require(appRoot + '/models/dnr_list');
var User = require(appRoot + '/models/dnr_users');
var _ = require('lodash');
var email_msgs = require(appRoot + '/message.json');

var config = require(appRoot + '/libs/config');
/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
    res.json({
        success: true,
        msg: 'Successfully hit sample api'
        // data: createdUser
    });
    return;
});

//add rating
router.post('/addRatings',function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        rating.update({
            "rated_by" : req.body.rated_by,
        },{
            $set : {
                rated_to : req.body.rated_to,
                is_rated : req.body.is_rated,
                ratings : req.body.ratings
            }
        },{upsert:true}).then(function(ratingData) {

             User.findOne({
          '_id' : req.body.rated_to
          },{email:1}).then(function(userData){

          var text = 'Hey There \n\n'+
                                       email_msgs.rating.rating_title;
            var subject = email_msgs.rating.rating_body;
            
            config.sendMail(userData.email.toLowerCase(), text, subject).then(function(error,result) {
                if (error) {
                    console.log(error);
                }

            });
             });
            res.json({
                success:true,
                msg:"rating Data Submited successfully",
                data:ratingData
            })
            return
        }).catch(function(error) {
            console.log(error)
            res.json({
                'success': false,
                'msg': "Failed to Add the ratingData"
            })
            return
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        })
    })

})
//MyRatings
router.post('/myRatings',function(req,res,next){

    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
    User.findOne({
        '_id' : req.body.rated_to
    },{rating:1}).then(function(userRatingTopics){
       
        rating.find({
            "rated_to":req.body.rated_to
        },{ratings:1}).then(function(ratingsGivenByUsers){

        ListItems.find({},{ratings:1,_id:1}).then(function(ratingTopics){
         //   console.log('myRatings',ratingTopics,ratingsGivenByUsers,userRatingTopics);
            let arrAdv =[], newArr =[], newArr1=[];            
            newArr[0] ={},newArr1[0]={};  

            let userInterest = userRatingTopics.rating;
            let userRating = userRatingTopics.rating;  
            
            let array = [];
            
            let ratings = ratingTopics[0].ratings;
            let listId = ratingTopics[0]._id;
            if(ratings.length>0){
            
            async.forEach(ratings,function (rt,cb1) {
                array[rt] =[];
                array[rt][0] = {};
                array[rt][1] =0;
                array[rt][2] =0;
                if(userRatingTopics){                  
                  
                    if(userRating.indexOf(rt)>-1){ 

                        if(ratingsGivenByUsers.length>0){
                          async.forEach(ratingsGivenByUsers,function (rgu,cb3) {
                              
                              let rating = rgu.ratings;
                              let keys = Object.keys(rating);  
                              // check rating topic in already given topics
                              if(keys.indexOf(rt)>-1){
                             
                                  let class1='fa fa-star-o border';
                                  let class2='fa fa-star-o border';
                                  let class3='fa fa-star-o border';
                                  let class4='fa fa-star-o border';
                                  let class5='fa fa-star-o border';
                                  array[rt][1] += parseInt(rating[rt]);
                                  array[rt][2] +=1;
                                  let avg = 0;
                                  avg = array[rt][1]/array[rt][2];
                                  if(isNaN(avg))
                                          avg = 0;
                                  if(avg==0)
                                    {
                                      class1=class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=0.1 && avg<=0.9)
                                    {
                                      class1 = 'fa fa-star-half-o checked';
                                      class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==1)
                                    {
                                      class1 = 'fa fa-star checked';
                                      class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=1.1 && avg<=1.9)
                                    {
                                      class1 = 'fa fa-star checked';
                                      class2 = 'fa fa-star-half-o checked';
                                      class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==2)
                                    {
                                      class1 =class2= 'fa fa-star checked';
                                      class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=2.1 && avg<=2.9)
                                    {
                                      class1 =class2= 'fa fa-star checked';
                                      class3 = 'fa fa-star-half-o checked';
                                      class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==3)
                                    {
                                      class1 =class2=class3= 'fa fa-star checked';
                                      class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=3.1 && avg<=3.9)
                                    {
                                      class1 =class2=class3= 'fa fa-star checked';
                                      class4= 'fa fa-star-half checked';
                                      class5='fa fa-star-o border';
                                    }
                                    else if(avg==4)
                                    {
                                      class1 =class2=class3=class4= 'fa fa-star checked';
                                      class5='fa fa-star-o border';
                                    }
                                    else if(avg>=4.1 && avg<=4.9)
                                    {
                                      class1 = class2=class3=class4= 'fa fa-star checked';
                                      class5 = 'fa fa-star-half-o checked';
                                      
                                    }
                                    else if(avg==5)
                                    {
                                      class1=class2=class3=class4=class5='fa fa-star checked';
                                    }

                                

                                  let json = {
                                      name  : rt,
                                      class5 : class5,
                                      class4 : class4,
                                      class3  :class3,
                                      class2 : class2,
                                      class1 : class1,
                                      value : Math.round(avg * 10) / 10,
                                      sum : array[rt][1],
                                      isSelect  : true
                                  }                               
                                  array[rt][0] = json;
                                  cb3();

                              } else {
                                
                                  array[rt][1] += parseInt(rating[rt]);
                                  array[rt][2] +=1;
                                  let avg = 0;
                                  avg = array[rt][1]/array[rt][2];
                                  if(isNaN(avg))
                                          avg = 0;
                                  let class1='fa fa-star-o border';
                                  let class2='fa fa-star-o border';
                                  let class3='fa fa-star-o border';
                                  let class4='fa fa-star-o border';
                                  let class5='fa fa-star-o border'; 
                                  if(avg==0)
                                    {
                                      class1=class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=0.1 && avg<=0.9)
                                    {
                                      class1 = 'fa fa-star-half-o checked';
                                      class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==1)
                                    {
                                      class1 = 'fa fa-star checked';
                                      class2=class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=1.1 && avg<=1.9)
                                    {
                                      class1 = 'fa fa-star checked';
                                      class2 = 'fa fa-star-half-o checked';
                                      class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==2)
                                    {
                                      class1 =class2= 'fa fa-star checked';
                                      class3=class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=2.1 && avg<=2.9)
                                    {
                                      class1 =class2= 'fa fa-star checked';
                                      class3 = 'fa fa-star-half-o checked';
                                      class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg==3)
                                    {
                                      class1 =class2=class3= 'fa fa-star checked';
                                      class4=class5='fa fa-star-o border';
                                    }
                                    else if(avg>=3.1 && avg<=3.9)
                                    {
                                      class1 =class2=class3= 'fa fa-star checked';
                                      class4= 'fa fa-star-half checked';
                                      class5='fa fa-star-o border';
                                    }
                                    else if(avg==4)
                                    {
                                      class1 =class2=class3=class4= 'fa fa-star checked';
                                      class5='fa fa-star-o border';
                                    }
                                    else if(avg>=4.1 && avg<=4.9)
                                    {
                                      class1 = class2=class3=class4= 'fa fa-star checked';
                                      class5 = 'fa fa-star-half-o checked';                                      
                                    }
                                    else if(avg==5)
                                    {
                                      class1=class2=class3=class4=class5='fa fa-star checked';
                                    }
                         
                              let json = {
                                  name  : rt,
                                  class5 : class5,
                                  class4 : class4,
                                  class3  :class3,
                                  class2 : class2,
                                  class1 : class1,
                                  value : Math.round(avg * 10) / 10,
                                  sum : array[rt][1],
                                  isSelect : true
                              }
                              array[rt][0] = json;
                                    cb3();
                              }

                          },function(){
                              cb1();
                          });
                      }
                      else
                      {
                       
                          let class1='fa fa-star-o border';
                            let class2='fa fa-star-o border';
                            let class3='fa fa-star-o border';
                            let class4='fa fa-star-o border';
                            let class5='fa fa-star-o border';                        
                            let json = {
                                name  : rt,
                                class5 : class5,
                                class4 : class4,
                                class3  :class3,
                                class2 : class2,
                                class1 : class1,
                                value : 0,
                                sum : array[rt][1],
                                isSelect : true
                            }
                            array[rt][0] = json;                        
                          cb1();
                      }

                    } else {
                            let class1='fa fa-star-o border';
                            let class2='fa fa-star-o border';
                            let class3='fa fa-star-o border';
                            let class4='fa fa-star-o border';
                            let class5='fa fa-star-o border';                        
                            let json = {
                                name  : rt,
                                class5 : class5,
                                class4 : class4,
                                class3  :class3,
                                class2 : class2,
                                class1 : class1,
                                value : 0,
                                sum : array[rt][1],
                                isSelect : false
                            }
                            array[rt][0] = json;                        
                          cb1();
                    }
                }
                else
                {
                    let class1='fa fa-star-o border';
                    let class2='fa fa-star-o border';
                    let class3='fa fa-star-o border';
                    let class4='fa fa-star-o border';
                    let class5='fa fa-star-o border'; 
                    let json = {
                        name  : rt,
                        class5 : class5,
                        class4 : class4,
                        class3  :class3,
                        class2 : class2,
                        class1 : class1,
                        value : 0,
                        sum : array[rt][1],
                        isSelect : false
                    }
                    array[rt][0] = json;
                    cb1();
                }
            },function(){
                //user rating topics which are not in general rating topics
                let difference = userRating.filter(x => !ratings.includes(x));
                if(difference.length>0){
                    exports.calculateRating(difference,array,ratingsGivenByUsers,function(error,callback){
                        
                    });
                }
                let newArr = {},newArr1 ={};
               
                Object.keys(array).forEach(function(key) {                    
                    newArr1[key] = {};                   
                    if(array[key][0].isSelect==true){
                    newArr[key] = {name : key,class1:array[key][0].class1,class2:array[key][0].class2,class3:array[key][0].class3,class4:array[key][0].class4,class5:array[key][0].class5,value:array[key][0].value,isSelect:array[key][0].isSelect};
                  }
                  else
                  {
                       newArr1[key] = {name : key,class1:array[key][0].class1,class2:array[key][0].class2,class3:array[key][0].class3,class4:array[key][0].class4,class5:array[key][0].class5,value:array[key][0].value,isSelect:array[key][0].isSelect};
                  }
                });
                _.merge(newArr,newArr1); // merge objects to show selected rating topics first
              
                res.json({
                    success:true,
                    msg:"My Rating Data Fetched successfully",
                    data:JSON.parse(JSON.stringify(newArr)),
                    listId:listId
                });
            });
            }
            else
            {
              
                res.json({
                    success:true,
                    msg:"My Rating Data Fetched successfully",
                    data:array[0],
                    listId:listId
                });
            }
            
         }).catch(function(error) {
            console.log(error)
            res.json({
                'success': false,
                'msg': "Failed to Fetched RatingData"
            })
            return
        })
        }).catch(function(error) {
            console.log(error)
            res.json({
                'success': false,
                'msg': "Failed to Fetched RatingData"
            })
            return
        })
    }).catch(function(error) {
            console.log(error)
            res.json({
                'success': false,
                'msg': "Failed to Fetched RatingData"
            })
            return
        })
        
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        })
    })
})

module.exports.calculateRating = function(difference,array,ratingsGivenByUsers,callback)
{
    async.forEach(difference,function (rt,cb1) {
        array[rt] =[];
        array[rt][0] = {};
        array[rt][1] =0;
        array[rt][2] =0;
     async.forEach(ratingsGivenByUsers,function (rgu,cb3) {
                            
        let rating = rgu.ratings;
        let keys = Object.keys(rating);  
        // check rating topic in already given topics
        if(keys.indexOf(rt)>-1){
            let class1='fa fa-star-o border';
            let class2='fa fa-star-o border';
            let class3='fa fa-star-o border';
            let class4='fa fa-star-o border';
            let class5='fa fa-star-o border';
            array[rt][1] += parseInt(rating[rt]);
            array[rt][2] +=1;
            let avg = array[rt][1]/array[rt][2];
            if(avg==0)
              {
                class1=class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(avg>=0.1 && avg<=0.9)
              {
                class1 = 'fa fa-star-half-o checked';
                class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(avg==1)
              {
                class1 = 'fa fa-star checked';
                class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(avg>=1.1 && avg<=1.9)
              {
                class1 = 'fa fa-star checked';
                class2 = 'fa fa-star-half-o checked';
                class3=class4=class5='fa fa-star-o border';
              }
              else if(avg==2)
              {
                class1 =class2= 'fa fa-star checked';
                class3=class4=class5='fa fa-star-o border';
              }
              else if(avg>=2.1 && avg<=2.9)
              {
                class1 =class2= 'fa fa-star checked';
                class3 = 'fa fa-star-half-o checked';
                class4=class5='fa fa-star-o border';
              }
              else if(avg==3)
              {
                class1 =class2=class3= 'fa fa-star checked';
                class4=class5='fa fa-star-o border';
              }
              else if(avg>=3.1 && avg<=3.9)
              {
                class1 =class2=class3= 'fa fa-star checked';
                class4= 'fa fa-star-half checked';
                class5='fa fa-star-o border';
              }
              else if(avg==4)
              {
                class1 =class2=class3=class4= 'fa fa-star checked';
                class5='fa fa-star-o border';
              }
              else if(avg>=4.1 && avg<=4.9)
              {
                class1 = class2=class3=class4= 'fa fa-star checked';
                class5 = 'fa fa-star-half-o checked';
                
              }
              else if(avg==5)
              {
                class1=class2=class3=class4=class5='fa fa-star checked';
              }

            let json = {
                name  : rt,
                class5 : class5,
                class4 : class4,
                class3  :class3,
                class2 : class2,
                class1 : class1,
                value : Math.round(avg * 10) / 10,
                sum : array[rt][1],
                isSelect  : true
            }                               
            array[rt][0] = json;
            cb3();

        } else {
            let class1='fa fa-star-o border';
            let class2='fa fa-star-o border';
            let class3='fa fa-star-o border';
            let class4='fa fa-star-o border';
            let class5='fa fa-star-o border';
          
          
                let json = {
                    name  : rt,
                    class5 : class5,
                    class4 : class4,
                    class3  :class3,
                    class2 : class2,
                    class1 : class1,
                    value : 0,
                    sum : array[rt][1],
                    isSelect : true
                }
                array[rt][0] = json;
              cb3();
        }

    },function(){
        cb1();
    });
    },function(){
      callback(null,array);
    });
 
}
router.post('/getParticularRating',function(req,res,next){
      rating.find({
            "rated_to":req.body.rated_to,
            "rated_by" : req.body.rated_by,
        },{ratings:1}).then(function(ratingData){
          
          if(ratingData.length>0){
          let keys = Object.keys(ratingData[0].ratings);  
          let ratingTopics = ratingData[0].ratings;
          if(keys.length>0){
             let array = [];

             async.forEach(keys,function (item,cb3) {
              array[item] =[];
              array[item][0] = {};
              let class1='fa fa-star-o border';
              let class2='fa fa-star-o border';
              let class3='fa fa-star-o border';
              let class4='fa fa-star-o border';
              let class5='fa fa-star-o border';
       
            if(ratingTopics[item]==0)
              {
                class1=class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]>=0.1 && ratingTopics[item]<=0.9)
              {
                class1 = 'fa fa-star-half-o checked';
                class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]==1)
              {
                class1 = 'fa fa-star checked';
                class2=class3=class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]>=1.1 && ratingTopics[item]<=1.9)
              {
                class1 = 'fa fa-star checked';
                class2 = 'fa fa-star-half-o checked';
                class3=class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]==2)
              {
                class1 =class2= 'fa fa-star checked';
                class3=class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]>=2.1 && ratingTopics[item]<=2.9)
              {
                class1 =class2= 'fa fa-star checked';
                class3 = 'fa fa-star-half-o checked';
                class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]==3)
              {
                class1 =class2=class3= 'fa fa-star checked';
                class4=class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]>=3.1 && ratingTopics[item]<=3.9)
              {
                class1 =class2=class3= 'fa fa-star checked';
                class4= 'fa fa-star-half checked';
                class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]==4)
              {
                class1 =class2=class3=class4= 'fa fa-star checked';
                class5='fa fa-star-o border';
              }
              else if(ratingTopics[item]>=4.1 && ratingTopics[item]<=4.9)
              {
                class1 = class2=class3=class4= 'fa fa-star checked';
                class5 = 'fa fa-star-half-o checked';
                
              }
              else if(ratingTopics[item]==5)
              {
                class1=class2=class3=class4=class5='fa fa-star checked';
              }
       
              let json = {
                name  : item,
                class5 : class5,
                class4 : class4,
                class3  :class3,
                class2 : class2,
                class1 : class1,
                value : Math.round(ratingTopics[item] * 10) / 10,              
                isSelect : true
              }
              array[item][0] = json;
             
              cb3();
              },function(){
                let newArr = {};
                Object.keys(array).forEach(function(key) {                    
                    newArr[key] = {};
                    newArr[key] = {name : key,class1:array[key][0].class1,class2:array[key][0].class2,class3:array[key][0].class3,class4:array[key][0].class4,class5:array[key][0].class5,value:array[key][0].value,isSelect:array[key][0].isSelect};
                });

                res.json({
                    success:true,
                    msg:"My Rating Data Fetched successfully",
                    data:JSON.parse(JSON.stringify(newArr))
                });
               
              });
          }
          else
          {
            res.json({
                    success:true,
                    msg:"My Rating Data Fetched successfully",
                    data:[]
                });
          }
        }
        else {
          res.json({
                    success:true,
                    msg:"My Rating Data Fetched successfully",
                    data:[]
                });
        }
      }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Unable to get rating",
            authStatus : 0
        })
    })  
})
module.exports = router;
