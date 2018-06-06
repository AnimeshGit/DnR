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
    var stripe_customer = require(appRoot + '/libs/stripe/customer');
    var stripe_plan = require(appRoot + '/libs/stripe/plan');
    var stripe_subscribe = require(appRoot + '/libs/stripe/subscription');
    var stripe_cards = require(appRoot + '/libs/stripe/cards');
/*
 * Favorite users
 * created by - AniMesh;
 * created on - 16th Nov 2017;
 * updated on - 13th Dec 2017;
 */
router.post('/add_favorites', function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var is_favorite = req.body.is_favorite;

        if (is_favorite == true) {
            Favorite.update({
                'favorite_to':req.body.favorite_to
            },{$set:
                {
                    "favorite_by": req.body.favorite_by,
                    "favorite_to": req.body.favorite_to,
                    "is_favorite": req.body.is_favorite
                }
            },{upsert:true}).then(function(FavData) {
                    res.json({
                        success: true,
                        msg: "Favorite added successfully",
                        data:FavData
                    })
                    return
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Failed to Add the favorite"
                })
                return
            })
        }else{
            var favorite_to = req.body.favorite_to;
            req.body.is_favorite = false
            Favorite.findOne({
                'favorite_to': favorite_to
            }).then(function(result) {
                console.log(result)
                var result1 = _.extend(result,req.body)
                result1.save(function(err, favoriteInfo) {
                    if (!err) {
                        res.json({
                            success: true,
                            msg: "Favorite removed successfully",
                            data:favoriteInfo
                        });
                        return;
                    } else {
                        res.json({
                            'success': false,
                            'msg': "Enter valid favorite Id",

                        });
                        return;
                    }
                })
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        })
    })
})
/*
Input Parameter : favorite_id
Description: Get user favorite data
*/
router.post('/get_favorites', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        Favorite.find({
            'favorite_by': req.body.favorite_by,'is_favorite':true
        }).then(function(favoriteData) {
            var FavList = [];
            
            if (favoriteData.length > 0) {
                var count = 0;
                i=0;
                favoriteData.forEach(function(FavoriteToList) {
                    User.findOne({'_id':FavoriteToList.favorite_to}).exec().then(function(FavoriteToInfo) {

                     Dates.findOne({$or: [{
                                            "date_receiver_id": req.body.favorite_by,"date_requester_id": FavoriteToList.favorite_to                                        
                            },{
                                "date_receiver_id": FavoriteToList.favorite_to,"date_requester_id":req.body.favorite_by
                            }]
                        }).then(function(dateData) {
                           if(dateData)
                            {                               
                               FavoriteToList['DateFlag'] = 1; 
                            }
                            else
                            {                               
                               FavoriteToList['DateFlag'] = 0;                                
                            }
                        });
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
                            res.json({
                                success: true,
                                msg: "Fetched all favorite user successfully",
                                data: FavList
                            })
                            return
                        } 
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            msg: "Failed to fetched favorite_to data"
                        })
                        return
                    })
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "No Fav Data "
                })
                return
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching favorite user"
            })
            return
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication Failed",
            authStatus : 1
        })
        return
    })
})
//  Blocked users
//  created on - 16th Nov 2017;
//  updated on - 13th Dec 2017;
router.post('/add_block', function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var is_blocked = req.body.is_blocked;
        if (is_blocked == true) {
            Blocked.update({
                'blocked_to':req.body.blocked_to
            },{$set:
                {
                    "blocked_by": req.body.blocked_by,
                    "blocked_to": req.body.blocked_to,
                    "is_blocked": req.body.is_blocked
                }
            },{upsert:true}).then(function(BlockData) {
                res.json({
                    success: true,
                    msg: "Blocked successfully",
                    data:BlockData
                })
                return
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Failed to Block"
                })
                return
            })
        }else{

             var blocked_to = req.body.blocked_to;
            req.body.is_blocked = false
            Blocked.findOneAndRemove({ "blocked_by":  req.body.blocked_by,
                    "blocked_to":  req.body.blocked_to
            }).then(function(result) {
                               
                        res.json({
                            success: true,
                            msg: "Blocked removed successfully",
                            data: result
                        })
                   
                        return;               
            }).catch(function(error) {
                  
                res.json({
                    'success': false,
                    'msg': "Something went wrong while removing the block"
                });
                return;
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        })
    })
})
//unblock all
//created on : 19th Jan 2018
router.post('/unblocked_all', function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var blocked_by = req.body.blocked_by
        
        Blocked.find({'blocked_by':blocked_by}).then(function(result){
            
            if (result.length==0) {
                res.json({
                    success: false,
                    msg: "no more users to unblock"
                });
                return
            }else{
                Blocked.deleteMany({ 
                    blocked_by: blocked_by 
                }, function(err) {
                    if (err) {
                        console.log(err)
                        res.send("got an error")
                    } else {
                        res.json({
                            success: true,
                            msg: "Unblocked All"
                        });
                        return
                    }
                })
    
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        });
        return
    })
})

/*unblock single user*/
router.post('/unblockEach',function(req,res){
    console.log(req.body)
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var blocked_by = req.body.blocked_by

        if (req.body.blocked_to.length==0) {
            res.json({
                success: false,
                msg: "Please select users to unblock"
            });
            return       
        }
        
        Blocked.deleteMany({         
                'blocked_by':blocked_by
        , blocked_to: { 
                $in: req.body.blocked_to
            }
        }, function(err) {
            if (err) {
                console.log(err)
                res.send("got an error")
            } else {
                res.json({
                    success: true,
                    msg: "You Successfully Unblocked This Users"
                });
                return
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        });
        return
    })
})


/*
Input Parameter : blocked_id
Description: Get users blocked data
*/
router.post('/get_blocked_list', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        Blocked.find({
            'blocked_by': req.body.blocked_by,
        }).exec().then(function(blockedData) {
            var BlockedList = [];
            
            if (blockedData.length > 0) {
                var count = 0;
                i=0;
                blockedData.forEach(function(BlockedToList) {
                    
                    User.findOne({'_id':BlockedToList.blocked_to}).exec().then(function(BlockedToInfo) {
                    
                        if (BlockedToInfo.photo)
                            if (BlockedToInfo.photo!=null   &&  BlockedToInfo.photo!=undefined  &&  BlockedToInfo.photo!="")
                                BlockedToInfo.photo=CONSTANTS.baseUrl + getImage + BlockedToInfo.photo
                        
                        var temp = _.merge(BlockedToList, BlockedToInfo)
                
                        BlockedList.push(temp);
                        count = count + 1;
                
                        if (count == blockedData.length) {
                            res.json({
                                success: true,
                                msg: "Fetched all blocked user successfully",
                                data: BlockedList
                            })
                            return
                        } 
                
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            msg: "Failed to fetched blocked_to data"
                        })
                        return
                    })
                })
            } else {
                res.json({
                    'success': true,
                     data : [],
                     msg: "You havn't blocked any user",
                })
                return
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching Blocked user"
            })
            return
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication Failed",
            authStatus : 1
        })
        return
    })
})
/*
 * Date The User
 * created on - 17th Nov 2017;
 */
router.post('/add_dates', function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var date_request = req.body.date_request
        var date_accept = req.body.date_accept
        var date_status = "pending"
        if (date_request == true) {
            Dates.update({
                'date_requester_id':req.body.date_requester_id,
                'date_receiver_id': req.body.date_receiver_id
            },{$set:
                {
                    "date_requester_id": req.body.date_requester_id,
                    "date_receiver_id": req.body.date_receiver_id,
                    "date_request": req.body.date_request,
                    "date_status": date_status,
                    "request_send_date": config.currentTimestamp
                }
            },{upsert:true}).then(function(AlreadyDatedData) {
                res.json({
                    success: true,
                    msg: "Date request sent successfully",
                    data: AlreadyDatedData
                })
                return
            }).catch(function(error) {
                console.log(error)
                res.json({
                    success:false,
                    msg:"Failed to Add Date"
                });
                return;
            })
        }else if(date_accept == true){
            /*Date Accept*/
            req.body.date_status = "accepted"
            req.body.request_accepted_date = config.currentTimestamp;
            Dates.findOne({
                'date_requester_id': req.body.date_requester_id,
                'date_receiver_id': req.body.date_receiver_id
            }).then(function(DateInfo) {
                if (DateInfo) {
                    var updatedDates = _.extend(DateInfo, req.body);
                    updatedDates.save(function(err, output) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "Failed to accept the Date"
                            })
                        } else {
                            res.json({
                                success: true,
                                msg: "Date request Accepted successfully",
                                data: output
                            });
                        }
                    }).catch(function(error) {
                        console.log(error);
                        res.json({
                            success: false,
                            msg: "Something went wrong while accepting Date"
                        })
                    })
                } else {
                    res.send("date not found");
                }
            })
        }else{
            /*date removed*/
            req.body.date_status = "rejected"
            req.body.date_accept = false
            Dates.findOne({
                'date_requester_id': req.body.date_requester_id,
                'date_receiver_id': req.body.date_receiver_id
            }).then(function(DateInfo) {
                if (DateInfo) {
                    var updatedDates = _.extend(DateInfo, req.body);
                    updatedDates.save(function(err, output) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "Failed to reject the Date"
                            })
                        } else {
                            res.json({
                                success: true,
                                msg: "Date request Rejected successfully",
                                data: output
                            });
                        }
                    }).catch(function(error) {
                        console.log(error);
                        res.json({
                            success: false,
                            msg: "Something went wrong while accepting Date"
                        })
                    })
                } else {
                    res.send("date not found");
                }
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus : 1
        })
    })
})
/*
Input Parameter : Dated by userId
Description: Get user dated data
*/
router.post('/get_dates', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        Dates.find({
            $or: [{
                    'date_requester_id': req.body.date_requester_id
                }, {
                    'date_receiver_id': req.body.date_receiver_id
                }]
        }).exec().then(function(datedData) {

        if (req.body.date_receiver_id) {        
            var DateList = [];
            if (datedData.length > 0) {
                var count = 0;
                i=0;
                datedData.forEach(function(DatedByList) {
                    
                    User.findOne({'_id':DatedByList.date_requester_id}).exec().then(function(DatedByInfo) {
                        if (DatedByInfo.photo){

                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!=""){

                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo
                            }
                        }
                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
                            console.log('2');
                            res.json({
                                success: true,
                                msg: "Fetched all Dated user successfully",
                                data: DateList
                            })
                        } 
                    }).catch(function(error) {
                        console.log(error)
                        res.json({
                            success: false,
                            msg: "Failed to fetched dated data"
                        })
                        return
                    })
                })
            } else {
                console.log('1');
                res.json({
                    'success': false,
                    'msg': "User don't have any Dated users "
                })
                return
            }
        } else{
            var DateList = [];
            if (datedData.length > 0) {
                var count = 0;
                i=0;
                datedData.forEach(function(DatedByList) {
                    User.findOne({'_id':DatedByList.date_receiver_id}).exec().then(function(DatedByInfo) {
                        if (DatedByInfo.photo){
                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!=""){
                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo
                            }    
                        }
                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
                            console.log('5');
                            res.json({
                                success: true,
                                msg: "Fetched all Dated user successfully",
                                data: DateList
                            })
                        } 
                    }).catch(function(error) {
                        console.log(error)
                        res.json({
                            success: false,
                            msg: "Failed to fetched dated data"
                        });
                        return;
                    })
                })
            } else {
                console.log('3');
                res.json({
                    'success': false,
                    'msg': "User don't have any Dated users "
                })
                return
            }
        };

        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching Dated user"
            })
        })
    }).catch(function(error) {
        console.log('4',error);
        res.json({
            success: false,
            msg: "Authentication Failed",
            authStatus : 1
        })
    })
})
/*
* Insert Ethnicity, Relationship Status, Searching For List
* Created On : 6th Dec 2017 
* Updated On : 7th Dec 2017 
*/
router.post('/insert_content',function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        console.log(req.body)
        // 
        if (req.body.is_ethinicity==true) {
            ListItems.findOne({
                '_id':req.body.ListItemsId
            }).then(function(ListItemsData) {
                
                var update_ethinicity_data = _.extend(ListItemsData,req.body)
                
                update_ethinicity_data.save(function(err, data) {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Failed to Add Ethnicity List"
                        });
                        return;
                    } else {
                        res.json({
                            success: true,
                            msg: "Ethinicity Updated Successfully",
                            data: data
                        });
                        return;
                    }
                })
            }).catch(function(error) {
                console.log(error);
                res.json({
                    success:true,
                    msg:"error while fetching data"
                });
                return;
            })
        } else if(req.body.is_relationship==true) {
            ListItems.findOne({
                '_id':req.body.ListItemsId
            }).then(function(ListItemsData) {
                var update_relations_data = _.merge(ListItemsData,req.body)
                update_relations_data.save(function(err, data1) {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Failed to Add Relationship List"
                        });
                        return;
                    } else {
                        res.json({
                            success: true,
                            msg: "Relationship Updated Successfully",
                            data: data1
                        });
                        return;
                    }
                })
            }).catch(function(error) {
                console.log(error);
                res.json({
                    success:true,
                    msg:"error while fetching data"
                });
                return;
            })
        } else if(req.body.is_rating == true) {
            User.findOne({
                '_id':req.body.userId
            }).then(function(UserData) {

                
                UserData.rating = req.body.ratings
                // console.log(UserData)
                // return
                
                var update_searching_data = _.merge(UserData,UserData)

                update_searching_data.save(function(err, data2) {
                // console.log(update_searching_data)
                // return

                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            msg: "Failed to Add Rating List"
                        });
                        return;
                    } else {
                        res.json({
                            success: true,
                            msg: "Searching List updated Successfully for Rating",
                            data: data2
                        });
                        return;
                    }
                })

            }).catch(function(error) {
                console.log(error);
                res.json({
                    success:true,
                    msg:"error while fetching searching data"
                });
                return;
            })
        
        }else{
            //adding interest
            User.findOne({
                '_id':req.body.userId
            }).then(function(UserData) {

                
                UserData.interest = req.body.interests
                // console.log(UserData)
                // return
                
                var update_searching_data = _.merge(UserData,UserData)

                update_searching_data.save(function(err, data2) {
                // console.log(update_searching_data)
                // return

                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            msg: "Failed to Add Interests Searching List"
                        });
                        return;
                    } else {
                        res.json({
                            success: true,
                            msg: "Searching List updated Successfully for Interests",
                            data: data2
                        });
                        return;
                    }
                })

            }).catch(function(error) {
                console.log(error);
                res.json({
                    success:true,
                    msg:"error while fetching searching data"
                });
                return;
            })
        }
    }).catch(function(error) {
        res.json({
            success:true,
            msg:"Authentication Failed",
            authStatus : 1
        })
    })
})
/*
* Api to get Ethnicity, Relationship Status, Searching For List
* Created On : 6th Dec 2017 
* Updated On : 7th Dec 2017 
*/
router.post('/get_list',function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        ListItems.find().then(function(ListData) {
            if (ListData!="") {
                res.json({
                    success:true,
                    data:ListData
                })
            } else{
                res.send("failed")
            };
        }).catch(function(error) {
            res.json({
                success:false,
                msg:"Not Geting Data"
            })
            return
        })
    }).catch(function(error) {
        res.json({
            'success':false,
            'msg':"Authentication failed",
            authStatus : 1
        })
        return
    })
})
/*
* filter data
* Created On : 8th Dec 2017 
* Updated On : 11th Dec 2017 
*/
router.post('/insert_filter_data',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        User.findOne({_id:req.body.userId}).then(function(data) {
            if (data) {
                filter_setting = {};
                filter_setting.looking_for = req.body.looking_for;
                filter_setting.age_range = req.body.age_range
                filter_setting.online_now = req.body.online_now
                filter_setting.photos_only = req.body.photos_only
                filter_setting.height_range = req.body.height_range
                filter_setting.weight_range = req.body.weight_range
                filter_setting.ethnicity = req.body.ethnicity
                filter_setting.relationship_status = req.body.relationship_status
                filter_setting.searching_for = req.body.searching_for

                data.filter_setting = filter_setting;

                data.save(function(err,result) {
                    if (!err) {
                        res.json({
                            success:true,
                            msg:"filter data successfully inserted",
                            data:result
                        })
                        return
                    } else{
                        res.json({
                            success:false,
                            msg:"failed to save filter data"
                        })
                        return
                    };
                })
            } else{
                res.send("failed to get data for merge")
            };
        }).catch(function(error) {
            res.json({
                success:false,
                msg:"failed to fetch data"
            })
            return
        })
    }).catch(function(error) {
        res.json({
            success:true,
            msg:"Authentication Failed",
            authStatus : 1
        })
        return
    })
})
//  get filter data
//  Created On : 12th Dec 2017 
//  Updated On : --th Dec 2017 
router.post('/get_filter_data',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        User.findOne({
            '_id': req.body.userId
        }).then(function(filterData) {
            if (filterData) {
                res.json({
                    success: true,
                    msg: "Fetched filter record successfully",
                    data: filterData.filter_setting
                })
                return
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get filter user record"
                })
                return
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter valid userId"
            })
            return
        })
    }).catch(function(error) {
        console.log(error)
        res.json({
            success:true,
            msg:"Authentication Failed",
            authStatus : 1
        })
        return
    })
})
/*
* Api for getting All Near Users
* Created On : 22nd Nov 2017
*/
router.post('/get_nearby_users',function(req,res,next) {
    var token = req.headers['accesstoken'];
    var nearByData = [];
    var lat = req.body.lat;
    var lng = req.body.lng;
    let distance = 100000000;
    let userId = req.body.userId;
    if(token!=null){
        jwtAuth.checkAuth(token).then(function(result) {
            
            User.findOne({ _id:  req.body.userId }).then(function(userData) {

                let location = userData.location;

                console.log(location)
                // return
                
                let is_upgrade = userData.is_upgrade;

                // if(!lat)
                //     lat = location[0];
                // if(!lng)
                //     lng = location[1];
                /*
                    Distance calculation query
                    db.runCommand({ geoNear : "dnr_users", near : [ 18.5204, 73.8567], spherical: true})


                    { _id: { $nin: [ObjectId(req.body.userId)] },location: { $geoWithin: { $centerSphere: [ [location[0],location[1]] ,distance / 3963.2 ] } } }
                

                    db.runCommand({_id: { $nin: [ObjectId(req.body.userId)] },geoNear : "dnr_users", near : [ location[0], location[1]], spherical: true})
                
                    YourModel.db.db.executeDbCommand({geoNear : "locations", near : [11.252,14.141], spherical: true }, function(err,res) { console.log(res.documents[0].results)});
                */
                //console.log('near by', location);

            if (location.length > 0) {

                User.collection.geoNear(location[0], location[1], {spherical: true, maxDistance: 10000000000000}).then(function(result1) { 

                    if (result1) {
                        var i=0;
                            if(i<result1['results'].length){
                                function next(){
                                result1['results'][i]['obj']['dist']  = [];
                                result1['results'][i]['obj']['DateFlag']  = 0;
                                result1['results'][i]['obj']['is_favorite']  = 0;
                                result1['results'][i]['obj']['isBlocked']  = 0;
                                result1['results'][i]['obj']['dist'] = result1['results'][i]['dis'];
                                
                                if(result1['results'][i]['obj'].photo!=""&&result1['results'][i]['obj'].photo!=undefined&&result1['results'][i]['obj'].photo!=null){
                                    if (result1['results'][i]['obj'].photo) {
                                        var picture = CONSTANTS.baseUrl + getImage + result1['results'][i]['obj'].photo;
                                        result1['results'][i]['obj'].photo = picture;
                                    }
                                }

                                if(result1['results'][i]['obj'].height!=""&&result1['results'][i]['obj'].height!=undefined&&result1['results'][i]['obj'].height!=null){
                                    converted_height = result1['results'][i]['obj'].height * 0.3937;
                                    result1['results'][i]['obj'].height = converted_height.toFixed(2);
                                }

                                if(result1['results'][i]['obj'].weight!=""&&result1['results'][i]['obj'].weight!=undefined&&result1['results'][i]['obj'].weight!=null){
                                    converted_weight = result1['results'][i]['obj'].weight * 2.2046;
                                    result1['results'][i]['obj'].weight = converted_weight.toFixed(2);
                                }
                               
                                Dates.findOne({$or: [{
                                            "date_receiver_id": userId,"date_requester_id": result1['results'][i]['obj']._id                                        
                                        },{
                                            "date_receiver_id": result1['results'][i]['obj']._id,"date_requester_id":userId
                                        }]
                                    }).then(function(dateData) {
                                       if(dateData)
                                        {
                                           
                                           result1['results'][i]['obj']['DateFlag'] = 1;
                                            

                                        }
                                        else
                                        {
                                           
                                           result1['results'][i]['obj']['DateFlag'] = 0;
                                            
                                        }
                                        //-------------
                                        Favorite.findOne({$or: [{
                                            "favorite_to": result1['results'][i]['obj']._id,"favorite_by":userId
                                        }]
                                    }).then(function(favData) {
                                        if(favData)
                                        {
                                           
                                            result1['results'][i]['obj']['is_favorite'] = 1;
                                        
                                        }
                                        else
                                        {
                                           
                                            result1['results'][i]['obj']['is_favorite'] = 0;
                                            
                                        }
                                        /*-------------*/
                                         Blocked.findOne({$or: [{
                                            "blocked_by": userId,"blocked_to": result1['results'][i]['obj']._id
                                        
                                        }]
                                        }).then(function(blockData) {                                           
                                            if(blockData)
                                            {
                                               
                                               result1['results'][i]['obj']['isBlocked'] = 1;
                                               
                                            }
                                            else
                                            {
                                               
                                               result1['results'][i]['obj']['isBlocked'] = 0;
                                               
                                            }
                                        }).catch(function(error){
                                            console.log(error);
                                        })
                                        /*------------------*/
                                    }).catch(function(error){
                                        console.log(error);
                                    })
                                    //---------------------
                                }).catch(function(error){
                                    console.log(error);
                                })
                                if (result1['results'][i]['obj']._id  !=  req.body.userId) {
                                    nearByData.push(result1['results'][i]['obj']);
                                };

                            if (i == result1['results'].length - 1) {
                                res.json({
                                    success:true,
                                    msg:"All Near By Users",
                                    data:nearByData
                                });
                            }
                            i++;
                            // here you can decide whether you want to do the next iteration
                            // or not by either calling next() or not.
                            next();           
                            // return;
                            // }
                            }
                            next();
                        }
                    } else{
                        res.send("data not get");
                    };                
                }).catch(function(error) {
                    console.log(error);
                    res.json({
                        success:false,
                        msg:"unable to get Latitude and Longitude"
                    });
                    return;
                });
            } else{
                User.aggregate(
                    {
                     $addFields: 
                       { 
                           dist: 0
                        }
                    }, function(err, data) {
                        let arr= [];
                        async.forEach(data,function (item,callback) { 
                            let objData = {}; 
                            objData = item;
                            Dates.findOne({$or: [{
                                            "date_receiver_id": userId,"date_requester_id": item._id                                        
                                        },{
                                            "date_receiver_id": item._id,"date_requester_id":userId
                                        }]
                                    }).then(function(dateData) {
                                       // console.log('dateData',dateData);
                                        if(dateData)
                                        {
                                           
                                            objData.DateFlag = 1;
                                            

                                        }
                                        else
                                        {
                                           
                                            objData.DateFlag = 0;
                                            
                                        }
                                        //-------------
                                        Favorite.findOne({$or: [{
                                            "favorite_to": item._id,"favorite_by":userId
                                        }]
                                    }).then(function(favData) {
                                    
                                        if(favData)
                                        {
                                           
                                            objData.is_favorite = 1;
                                        
                                        }
                                        else
                                        {
                                           
                                            objData.is_favorite = 0;
                                            
                                        }
                                        /*-------------*/
                                         Blocked.findOne({$or: [{
                                            "blocked_by": userId,"blocked_to": data[i]._id
                                        
                                        }]
                                        }).then(function(blockData) {
                                        if(blockData)
                                        {
                                           
                                            objData.isBlocked = 1;
                                           
                                        }
                                        else
                                        {
                                           
                                            objData.isBlocked = 0;
                                           
                                        }

                                        if(item.photo!=""&&item.photo!=undefined&&item.photo!=null){
                                            if (item.photo) {
                                                var picture = CONSTANTS.baseUrl + getImage + item.photo;
                                                item.photo = picture;
                                            }
                                        }

                                        if(item.height!=""&&item.height!=undefined&&item.height!=null){
                                            converted_height = item.height * 0.3937;
                                            item.height = converted_height.toFixed(2);
                                        }

                                        if(item.weight!=""&&item.weight!=undefined&&item.weight!=null){
                                            converted_weight = item.weight * 2.2046;
                                            item.weight = converted_weight.toFixed(2);
                                        }

                                        if (item._id  !=  userId) {
                                             arr.push(objData);
                                        };
                                       
                                        callback();

                                        }).catch(function(error){
                                            console.log(error);
                                        })
                                        /*------------------*/
                                    }).catch(function(error){
                                        console.log(error);
                                    })
                                    //---------------------
                                }).catch(function(error){
                                    console.log(error);
                                })                             
                               
                                //----------------------------------------
                           
                        },function(){
                              res.json({
                                success:true,
                                data:arr
                            });
                            return;
                        });

                      
                });
            };
            }).catch(function(error){
                console.log(error);
                     res.json({
                    success:false,
                    msg:"user not exist"
                });
                return;
            })
        }).catch(function(error) {
            res.json({
                success:false,
                msg:"Authentication failed",
                authStatus : 1
            });
            return;
        });
    }
    else
    {
        res.json({
            success:false,
            msg:"Authentication failed",
            authStatus : 1
        });
        return;  
    }
})
/*
* Api for updating Lat Lng
* Created On : 1st Dec 2017
*/
router.post('/update_lat_lng',function(req,res,next) {
    var token = req.headers['accesstoken'];
    console.log('okk');
    jwtAuth.checkAuth(token).then(function(result) {
                
        if (req.body.latitude == "" || req.body.latitude == undefined || req.body.latitude == null) {
            res.json({
                'success':false,
                'msg':"Unable to update location"
            });
            return;
        } else{
            var tmpArr = [];
            tmpArr.push(req.body.latitude);
            tmpArr.push(req.body.longitude);

            console.log('update_lat_lng =>',tmpArr);
            
            User.findOneAndUpdate({
                _id: req.body.userId
            }, {
                $set: {
                    'location' : tmpArr
                }
            }, {
                'new': true
            }, function(err, data) {
                // console.log('update lat lng resp => ',data);
                res.json({
                    'success':true,
                    'msg':"latitude longitude successfully updated",
                    'data':data
                });
                return;
            });
        };
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success':true, //temporary
            'msg':"Authentication failed",
            authStatus : 1
        });
        return;
    })
})

/*
* Api for updating device token
* Created On : 23rd Feb 2018
*/
router.post('/update_device_token',function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {        
        
        if (req.body.userId == "" || req.body.device_type == undefined || req.body.device_token == null) {
            res.json({
                'success':false,
                'msg':"Send manditory fields"
            });
            return;
        } else{

            // User.findOne({
            //     '_id': userId
            // }).then(function(userData) {


            var tmpArr = [];
            tmpArr.push(req.body.device_type);
            tmpArr.push(req.body.device_token);

            console.log('update_lat_lng =>',tmpArr);
            
            User.findOneAndUpdate({
                _id: req.body.userId
            }, {
                $set: {
                    'location' : tmpArr
                }
            }, {
                'new': true
            }, function(err, data) {
                // console.log('update lat lng resp => ',data);
                res.json({
                    'success':true,
                    'msg':"latitude longitude successfully updated",
                    'data':data
                });
                return;
            });
        };
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success':false,
            'msg':"Authentication failed",
            authStatus : 1
        });
        return;
    })
})

//CreatedOn: 6th March 2018
router.post('/getPlans', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {        
        
    var stripe_customer = require(appRoot + '/libs/stripe/customer');
    var stripe_plan = require(appRoot + '/libs/stripe/plan');
    stripe_plan.list_plans(function(err,callback){
        if(err)
        {
            res.json({
                success: false,
                msg: "Failed to get Packages record"
            });
            return;
        }else
        {
            res.json({
                success: true,
                msg: "Fetched All Packages Record Successfully",
                data: callback.data
            });
            return;
            console.log(callback);
        }
    });
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success':false,
            'msg':"Authentication failed",
            authStatus : 1
        });
        return;
    })
});

//CreatedOn: 6th March 2018
router.post('/stripePayment', function(req, res, next) {
    let userId = req.body.userId;
    let planId = req.body.planId;
    let stripeToken = req.body.CardId;
    
    var token = req.headers['accesstoken'];
    
    jwtAuth.checkAuth(token).then(function(result) {      
    User.findOne({
    '_id': userId
    }).then(function(userData) {
        //console.log(userData);
    if (userData) {
        let email = userData.email;  
        let stripe_customer_id = userData.stripe_customer_id;
        if(!stripe_customer_id)
        {
            //create new cusomer on stripe
            let reqData = {
              email: email,
              description : "Stripe payment For "+email,
              source: stripeToken // obtained with Stripe.js
            }
            stripe_customer.create_customer(reqData,function(err,callback){
                if(err){
                    res.send({
                            success: false,
                            msg: 'Unable to make payment'
                        });
                        return;
                }
                else
                {
                                          
                        User.findOneAndUpdate({
                            _id: userId
                        }, {
                            $set: {
                                'stripe_customer_id': callback.id,
                            }
                        }, {
                            'new': true
                        }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                // res.send(data);
                            }
                        });
                    //make payment 
             
                    reqData = {
                        customer : callback._id,
                        items : [{
                            plan : planId
                        }]
                    }
                    stripe_subscribe.create_subscription(reqData,function(err,callback){
                        if(err)
                        {
                            res.send({
                                success: false,
                                msg:"Unable to make payment"
                            });
                            return;
                        }
                        else
                        {
                            User.findOneAndUpdate({
                            _id: userId
                            }, {
                                $set: {
                                    'is_upgrade': true,
                                }
                            }, {
                                'new': true
                            }, function(err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // res.send(data);
                                }
                            });
                            res.send({
                                success: true,
                                msg:"Payment Successful",
                                data: callback
                            });
                            return;
                        }
                    });
                }
            })

        }
        else
        {
            //make payment
             reqData = {
                        customer : stripe_customer_id,
                        items : [{
                            plan : planId
                        }]
                    }
                    stripe_subscribe.create_subscription(reqData,function(err,callback){
                        if(err)
                        {
                            console.log(err);
                            res.send({
                                success: false,
                                msg: 'User not Found'
                            });
                            return;
                        }
                        else
                        {
                             User.findOneAndUpdate({
                            _id: userId
                            }, {
                                $set: {
                                    'is_upgrade': true,
                                }
                            }, {
                                'new': true
                            }, function(err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // res.send(data);
                                }
                            });
                            res.send({
                                success: true,
                                msg:"Payment Successful",
                                data: callback
                            });
                            return;
                        }
                        
                    });
        }
    }
    else
    {
        res.send({
            success: false,
            msg: 'User not Found'
        });
        return;
    }
    });
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success':false,
            'msg':"Authentication failed",
            authStatus : 1
        });
        return;
    })
});

//CreatedOn: 6th March 2018
router.post('/getAllCards', function(req, res, next) {
    let stripeCustomerId = req.body.stripeCustomerId;
    let userId = req.body.userId;
    console.log(userId,stripeCustomerId);

    if(stripeCustomerId)
    {
        stripe_cards.list_cards(stripeCustomerId,function(err,callback){
            if(err)
            {
                res.send({
                    success: false,
                    msg: 'Unable to get cards'
                });
                return;
            }else
            {
                // console.log(callback.data.length)

                if (callback.data.length>0) {
                    
                    res.send({
                        success: true,
                        data: callback.data
                    });
                    return;
                
                } else{

                    
                    res.send({
                        success: false,
                        msg : "No Cards in the List Please Add your card",
                        data: callback.data
                    });
                    return;

                };
            }
        });
    }
    else
    {
        res.send({
            success: false,
            msg: 'No cards added'
        });
        return;
    }
});

//CreatedOn: 6th March 2018
router.post('/addCard', function(req, res, next) {

    let userId = req.body.userId;
    // let planId = req.body.planId;
    // let stripeToken = req.body.stripeToken;
    
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {      
    
    User.findOne({
        '_id': userId
    }).then(function(userData) {

    
        if (userData) {
            let email = userData.email;  
            let stripe_customer_id = userData.stripe_customer_id;
            
            if(stripe_customer_id){
                
                let reqData = {
                    source : {
                        object : 'card',
                        exp_month : req.body.exp_month,
                        exp_year : req.body.exp_year,
                        number : req.body.card_number,
                        cvc : req.body.cvc
                    }
                }

                // console.log(reqData);
                
                stripe_cards.create_card(stripe_customer_id,reqData,function(err,callback){
                    
                    if (err) {
                        res.send({
                            success: false,
                            data: err.message
                        });
                        return; 
                    } else{
                        res.send({
                            success: true,
                            msg:"Card Successfully Added",
                            data: callback
                        });
                        return;    
                    };
                });
            }
            else
            {
                let reqData = {
                  email: email,
                  description : "Stripe payment For "+email,
                 // source: stripeToken // obtained with Stripe.js
                }
                stripe_customer.create_customer(reqData,function(err,callback){
                    
                    if(err){
                    	console.log(err);
                        res.send({
                            success: false,
                            msg: 'Unable to create customer'
                        });
                        return;
                    }
                    else
                    {
                       
                        User.findOneAndUpdate({
                            _id: userId
                        }, {
                            $set: {
                                'stripe_customer_id': callback.id,
                            }
                        }, {
                            'new': true
                        }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                // res.send(data);
                            }
                        });

                    	//update customer id in mongo
                        let reqData = {
                            source : {
                                object : 'card',
                                exp_month : req.body.exp_month,
                                exp_year:req.body.exp_year,
                                number: req.body.card_number,
                                cvc: req.body.cvc
                            }
                        }

                        stripe_cards.create_card(callback.id,reqData,function(err,callback){
                     
                            if(err)
                            {
                            	console.log(err);
                                res.send({
                                    success: true,
                                    msg: 'Unable to save card'
                                });
                                return;
                            
                            }else{
                                
                                // console.log(callback);
                                res.send({
                                    success: true,
                                    msg:"Card Successfully Added",
                                    data: callback
                                });
                                return;
                            }
                        });
                    }
                });
            }
        }else {
            res.json({
                'success':false,
                'msg':"User not found"
            });
            return;
        }

    });
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success':false,
            'msg':"Authentication failed",
            authStatus : 1
        });
        return;
    })
});

module.exports = router;