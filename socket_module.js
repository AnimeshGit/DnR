var www = require('./bin/www');
var helper = require(appRoot + '/helper.js');
var socketIO = www.socketIo;
var express = require('express');
var router = express.Router();
var Favorite = require(appRoot + '/models/dnr_favorites');
var Dates = require(appRoot + '/models/dnr_dates');
var Blocked = require(appRoot + '/models/dnr_blocked');
var User = require(appRoot + '/models/dnr_users');
var Token = require(appRoot + '/models/dnr_token');
var ListItems = require(appRoot + '/models/dnr_list');
var config = require(appRoot + '/libs/config');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var randomString = require('randomstring');
var _ = require('lodash');
var fileUpload = require(appRoot + '/libs/fileupload');
var fs = require("fs");
var async = require("async");
var geolib = require("geolib");
var ObjectId = require('mongoose').Types.ObjectId;
var getImage = 'uploads/users/';
var userImage = '/public/uploads/users/';
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var email_msgs = require(appRoot + '/message.json'); 
const CONSTANTS = require(appRoot + '/Constants/constant'); 
// liveUsers which are currently online
var liveUsers = {};
const AllUsers = "AllUsers";

//Connect user
socketIO.on('connection', function(socket) {
    var pingTimer = setTimeout(function() {
        socketIO.sockets.in(AllUsers).emit('ping', {
            ping: '1'
        });
    }, 10000);

    //join to global object
    socket.on('connectUser', function(user_id) {   
        socket.user_id = user_id;
        liveUsers[user_id] = user_id;
        liveUsers[user_id] = {
            socketid: socket.id
        };
        socket.join(AllUsers);
    });

    //get user by users
    socket.on('nearByUsers',function(reqData){
        let user_id = reqData.user_id;
        let lat = reqData.lat;
        let lng = reqData.lng;
    });

    //block/unblock user
    socket.on('blockUser',function(reqData){
        let blocked_by = reqData.blocked_by;
        let blocked_to = reqData.blocked_to;
        var is_blocked = reqData.is_blocked;
        if (is_blocked == true) {
            Blocked.update({
                'blocked_to': blocked_to
            },{$set:
                {
                    "blocked_by": blocked_by,
                    "blocked_to": blocked_to,
                    "is_blocked": is_blocked
                }
            },{upsert:true}).then(function(BlockData) {
                var resData = {
                    success: true,
                    msg: "Blocked successfully",
                    data:BlockData
                };
                socketIO.sockets.in(liveUsers[blocked_by].socketid).emit('responseBlockUser', resData);              
            }).catch(function(error) {              
                var resData ={
                    'success': false,
                    'msg': "Failed to Block"
                };
                socketIO.sockets.in(liveUsers[blocked_by].socketid).emit('responseBlockUser', resData);  
            })
        }else{
            var blocked_to = blocked_to;
            is_blocked = false
            Blocked.findOne({
                'blocked_to': blocked_to
            }).then(function(result) {
                var result1 = _.extend(result,reqData)
                result1.save(function(err, blockedInfo) {
                    if (!err) {                      
                        var resData = {
                            success: true,
                            msg: "Blocked removed successfully",
                            data: blockedInfo
                        };
                        socketIO.sockets.in(liveUsers[blocked_by].socketid).emit('responseBlockUser', resData);  
                    } else {
                        var resData = {
                            'success': false,
                            'msg': "Enter valid block Id"
                        };
                        socketIO.sockets.in(liveUsers[blocked_by].socketid).emit('responseBlockUser', resData);        
                    }
                })
            }).catch(function(error) {
               
                var resData = {
                    'success': false,
                    'msg': "Something went wrong while removing the block"
                };
                socketIO.sockets.in(liveUsers[blocked_by].socketid).emit('responseBlockUser', resData);                  
            })
        }
    });
    //make favorite to particular user
    socket.on('makeFavorite',function(reqData){
        let favorite_by = reqData.favorite_by;
        let favorite_to = reqData.favorite_to;  
        var is_favorite = reqData.is_favorite;        
        if (is_favorite == true) {
            Favorite.update({
                'favorite_to':reqData.favorite_to
            },{$set:
                {
                    "favorite_by": favorite_by,
                    "favorite_to": favorite_to,
                    "is_favorite": is_favorite
                }
            },{upsert:true}).then(function(FavData) {
                  
                    let resData = {
                        success: true,
                        msg: "Favorite added successfully",
                        data:FavData
                    };
                    socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseMakeFavorite', resData); 
                    socketIO.sockets.in(liveUsers[favorite_to].socketid).emit('responseMakeFavorite', resData); 
            }).catch(function(error) {
              
                let resData = {
                    'success': false,
                    'msg': "Failed to Add the favorite"
                };
                socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseMakeFavorite', resData);
            })
        }else{
           
            is_favorite = false
            Favorite.findOne({
                'favorite_to': favorite_to
            }).then(function(result) {
                let reqData = {
                    'favorite_to' : favorite_to,
                    'favorite_by' : favorite_by,
                    'is_favorite' : false
                }
                var result1 = _.extend(result,reqData)
                result1.save(function(err, favoriteInfo) {
                    if (!err) {                      
                        let resData = {
                            success: true,
                            msg: "Favorite removed successfully",
                            data:favoriteInfo
                        };
                       // socketIO.sockets.in(liveUsers[favorite_by]).emit('responseMakeFavorite', resData);
                        socketIO.sockets.in(liveUsers[favorite_to].socketid).emit('responseMakeFavorite', resData);
                    } else {                       
                        let resData = {
                            'success': false,
                            'msg': "Enter valid favorite Id"
                        };
                        socketIO.sockets.in(liveUsers[favorite_to].socketid).emit('responseMakeFavorite', resData);
                    }
                })
            })
        }
    });
    //get favorite users
    socket.on('getFavorites',function(reqData){
        let favorite_by = reqData.favorite_by;
        Favorite.find({
            'favorite_by': favorite_by
        }).then(function(favoriteData) {
            var FavList = [];
            
            if (favoriteData.length > 0) {
                var count = 0;
                i=0;
                favoriteData.forEach(function(FavoriteToList) {
                    User.findOne({'_id':FavoriteToList.favorite_to}).exec().then(function(FavoriteToInfo) {
                        if (FavoriteToInfo.photo) {
                            if (FavoriteToInfo.photo != null && FavoriteToInfo.photo != "" && FavoriteToInfo.photo != undefined) {
                                var picture = CONSTANTS.baseUrl + getImage + FavoriteToInfo.photo;
                                FavoriteToInfo.photo = picture;
                            }
                        }
                        var temp = _.merge(FavoriteToList, FavoriteToInfo)
                        FavList.push(temp);
                        count = count + 1;                        
                        if (count == favoriteData.length) {
                         
                            let resData = {
                                success: true,
                                msg: "Fetched all favorite user successfully",
                                data: FavList
                            };
                            socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseFavorites', resData); 
                        } 
                    }).catch(function(error) {
                        let resData = {
                            success: false,
                            msg: "Failed to fetched favorite_to data"
                        };
                        socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseFavorites', resData); 
                    })
                })
            } else {               
                let resData = {
                    'success': false,
                    'msg': "No Fav Data "
                };
                socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseFavorites', resData); 
            }
        }).catch(function(error) {            
            let resData = {
                'success': false,
                'msg': "Something went wrong while removing the block"
            };
            socketIO.sockets.in(liveUsers[favorite_by].socketid).emit('responseFavorites', resData); 
        });
    });
    //requestDate
    socket.on('requestDate', function(reqData){
        var date_request = reqData.date_request;
        var date_accept = reqData.date_accept;
        var date_status = "pending";
        if (date_request == true) {
            Dates.update({
                'date_requester_id':reqData.date_requester_id,
                'date_receiver_id': reqData.date_receiver_id
            },{$set:
                {
                    "date_requester_id": reqData.date_requester_id,
                    "date_receiver_id": reqData.date_receiver_id,
                    "date_request": reqData.date_request,
                    "date_status": date_status,
                    "request_send_date": config.currentTimestamp
                }
            },{upsert:true}).then(function(AlreadyDatedData) {
                
                let resData = {
                    success: true,
                    msg: "Date request sent successfully",
                    data: AlreadyDatedData
                };
                socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
            }).catch(function(error) {
                console.log(error)

                let resData = {
                    success:false,
                    msg:"Failed to Add Date"
                };
                socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
            })
        }else if(date_accept == true){
            /*Date Accept*/
            reqData.date_status = "accepted";
            reqData.request_accepted_date = config.currentTimestamp;
            Dates.findOne({
                'date_requester_id': reqData.date_requester_id,
                'date_receiver_id': reqData.date_receiver_id
            }).then(function(DateInfo) {
                if (DateInfo) {
                    var updatedDates = _.extend(DateInfo, reqData);
                    updatedDates.save(function(err, output) {
                        if (err) {                           
                            let resData = {
                                success: false,
                                msg: "Failed to accept the Date"
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                        } else {                         
                            let resData = {
                                success: true,
                                msg: "Date request Accepted successfully",
                                data: output
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                        }
                    }).catch(function(error) {
                        console.log(error);
                       
                        let resData = {
                            success: false,
                            msg: "Something went wrong while accepting Date"
                        };
                        socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 

                    })
                } else {
                   
                    let resData = {
                        success: false,
                        msg: "date not found"
                    };
                    socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                }
            })
        }else{
            /*date removed*/
            reqData.date_status = "rejected"
            reqData.date_accept = false
            Dates.findOne({
                'date_requester_id': reqData.date_requester_id,
                'date_receiver_id': reqData.date_receiver_id
            }).then(function(DateInfo) {
                if (DateInfo) {
                    var updatedDates = _.extend(DateInfo, reqData);
                    updatedDates.save(function(err, output) {
                        if (err) {
                           
                            let resData = {
                                success: false,
                                msg: "Failed to reject the Date"
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                        } else {
                           
                            let resData = {
                                success: true,
                                msg: "Date request Rejected successfully",
                                data: output
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                        }
                    }).catch(function(error) {
                        console.log(error);                        
                        let resData = {
                            success: false,
                            msg: "Something went wrong while accepting Date"
                        };
                        socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                    })
                } else {
                   
                    let resData = {
                        success: false,
                        msg: "date not found"
                    };
                    socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseDate', resData); 
                }
            })
        };
    });
    socket.on('getDates',function(reqData){
        let date_requester_id = reqData.date_requester_id;
        let date_receiver_id = reqData.date_receiver_id;
        let date_requester_id = reqData.date_requester_id;

        Dates.find({
            $or: [{
                    'date_requester_id': date_requester_id
                }, {
                    'date_receiver_id': date_receiver_id
                }]
        }).exec().then(function(datedData) {

        if (date_receiver_id) {        
            var DateList = [];
            if (datedData.length > 0) {
                var count = 0;
                i=0;
                datedData.forEach(function(DatedByList) {
                    User.findOne({'_id':DatedByList.date_requester_id}).exec().then(function(DatedByInfo) {
                        if (DatedByInfo.photo)
                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!="")
                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo
                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
                            
                            let resData = {
                                success: true,
                                msg: "Fetched all Dated user successfully",
                                data: DateList
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
                        } 
                    }).catch(function(error) {
                        console.log(error);                   
                        let resData = {
                            success: false,
                            msg: "Failed to fetched dated data"
                        };
                        socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
                    })
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User don't have any Dated users "
                })
                let resData = {
                    'success': false,
                    'msg': "User don't have any Dated users "
                };
                socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
            }
        } else{
            var DateList = [];
            if (datedData.length > 0) {
                var count = 0;
                i=0;
                datedData.forEach(function(DatedByList) {
                    
                    User.findOne({'_id':DatedByList.date_receiver_id}).exec().then(function(DatedByInfo) {
                        if (DatedByInfo.photo)
                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!="")
                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo

                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
                            
                            let resData = {
                                success: true,
                                msg: "Fetched all Dated user successfully",
                                data: DateList
                            };
                            socketIO.sockets.in(liveUsers[date_requester_id]).emit('responseGetDates', resData); 
                        } 
                    }).catch(function(error) {
                        console.log(error);                    
                        let resData = {
                            success: false,
                            msg: "Failed to fetched dated data"
                        };
                        socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
                    })
                })
            } else {                
                let resData = {
                    'success': false,
                    'msg': "User don't have any Dated users "
                };
                socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
            }
        };
        }).catch(function(error) {
            console.log(error);            
            let resData = {
                success: false,
                msg: "Something went wrong while fetching Dated user"
            };
            socketIO.sockets.in(liveUsers[date_requester_id].socketid).emit('responseGetDates', resData); 
        });
    });
    //get user by users
    socket.on('onlineOffline',function(reqData){
        let user_id = reqData.user_id;
        let status = reqData.status;       

    });

});