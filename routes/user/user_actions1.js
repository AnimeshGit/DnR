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
                            'msg': "Enter valid favorite Id"
                        });
                        return;
                    }
                })
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
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
            'favorite_by': req.body.favorite_by
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
            msg: "Authentication Failed"
        })
        return
    })
})
/*
 * Blocked users
 * created on - 16th Nov 2017;
 * updated on - 13th Dec 2017;
 */
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
            Blocked.findOne({
                'blocked_to': blocked_to
            }).then(function(result) {
                var result1 = _.extend(result,req.body)
                result1.save(function(err, blockedInfo) {
                    if (!err) {
                        res.json({
                            success: true,
                            msg: "Blocked removed successfully",
                            data: blockedInfo
                        })
                        return
                    } else {
                        res.json({
                            'success': false,
                            'msg': "Enter valid block Id"
                        })
                        return
                    }
                })
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
            msg: "Authentication failed"
        })
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
                    'success': false,
                    'msg': "No Blocked Data "
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
            msg: "Authentication Failed"
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
            msg: "Authentication failed"
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
                        if (DatedByInfo.photo)
                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!="")
                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo
                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
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
                        if (DatedByInfo.photo)
                            if (DatedByInfo.photo!=null   &&  DatedByInfo.photo!=undefined  &&  DatedByInfo.photo!="")
                                DatedByInfo.photo=CONSTANTS.baseUrl + getImage + DatedByInfo.photo

                        var temp = _.merge(DatedByList, DatedByInfo)
                        DateList.push(temp);
                        count = count + 1;

                        if (count == datedData.length) {
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
                res.json({
                    'success': false,
                    'msg': "User don't have any Dated users "
                })
                return
            }
            // res.json({
            //     success: true,
            //     msg: "Fetched all Dated user successfully",
            //     data: datedData
            // })
        };
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching Dated user"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication Failed"
        })
    })
})
/*
* Api for getting All Near Users
* Created On : 22nd Nov 2017
*/
router.post('/get_nearby_users',function(req,res,next) {
    var token = req.headers['accesstoken'];
    var nearByData = [];
    if(token!=null){
        jwtAuth.checkAuth(token).then(function(result) {
            User.find({ _id: { $nin: [ObjectId(req.body.userId)] } }).then(function(result1) {
                if (result1) {

                        for (var i = 0; i < result1.length; i++) {
                            // result1[i];
                            if (result1[i].photo) {
                                var picture = CONSTANTS.baseUrl + getImage + result1[i].photo;
                                result1[i].photo = picture;
                            }
                            nearByData.push(result1[i]);
                        };

                        for (var i = 0; i < result1.length; i++) {
                            if(result1[i].height!=""&&result1[i].height!=undefined&&result1[i].height!=null){
                                converted_height = result1[i].height * 0.3937;
                                result1[i].height = converted_height;
                            }
                        }
                        for (var i = 0; i < result1.length; i++) {
                            if(result1[i].weight!=""&&result1[i].weight!=undefined&&result1[i].weight!=null){
                                converted_weight = result1[i].weight * 2.2046;
                                result1[i].weight = converted_weight;
                            }
                        }
                    

                    res.json({
                        success:true,
                        msg:"All Near By Users",
                        data:result1
                    });
                    return;
                } else{
                    res.send("data not get");
                };
            }).catch(function(error) {
                console.log(error);
                res.json({
                    success:false,
                    msg:"unable to trace logged_in user data"
                });
                return;
            })
        }).catch(function(error) {
            res.json({
                success:false,
                msg:"Authentication failed"
            });
            return;
        });
    }
    else
    {
        res.json({
            success:false,
            msg:"Authentication failed"
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
    jwtAuth.checkAuth(token).then(function(result) {
        
        User.findOneAndUpdate({
            _id: req.body.userId
        }, {
            $set: {
                'latitude': req.body.latitude,
                'longitude': req.body.longitude
            }
        }, {
            'new': true
        }, function(err, data) {
            res.json({
                'success':true,
                'msg':"latitude longitude successfully updated"
            });
            return;
        });
    }).catch(function(error) {
        res.json({
            'success':false,
            'msg':"Authentication failed"
        });
        return;
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
        if (req.body.is_ethinicity==true) {
            
            ListItems.findOne({
                '_id':req.body.ListItemsId
            }).then(function(ListItemsData) {
                var update_ethinicity_data = [];
                var update_ethinicity_data = _.merge(ListItemsData,req.body)
                
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
                
                var update_relations_data = [];
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
        }else{
            ListItems.findOne({
                '_id':req.body.ListItemsId
            }).then(function(ListItemsData) {
                console.log("ListItemsData",ListItemsData)
                console.log("interests",req.body.interests)
                return

                var update_searching_data = [];
                var update_searching_data = _.merge(ListItemsData,req.body)

                update_searching_data.save(function(err, data2) {

                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            msg: "Failed to Add Searching List"
                        });
                        return;
                    } else {
                        res.json({
                            success: true,
                            msg: "Searching List updated Successfully",
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
            msg:"Authentication Failed"
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
                    msg:ListData
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
            'msg':"Authentication failed"
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
            msg:"Authentication Failed"
        })
        return
    })
})
// get filter data
// Created On : 12th Dec 2017 
// Updated On : --th Dec 2017 
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
            msg:"Authentication Failed"
        })
        return
    })
})

module.exports = router;