var stripe = require('stripe')('sk_test_Z5EXtf7uNhmn2Y8CLvptdrRN');

/*
Create a plan
You can create plans using the API, or in the Stripe 

reqData = {
	  amount: 5000,
	  interval: "month",
	  name: "Titanium full",
	  currency: "usd",
	  id: "titanium-full"
	}
*/

//function create_plan(reqData,callback) {
module.exports.create_plan = function(reqData,callback) {
	stripe.plans.create(reqData, function (err, plan) {
		if (err) {
			console.log("create_plan=>", err);
			callback(err, null);
		}
		else {
			callback(null, plan);
		}
	});
}

/*
Update a plan
You can create plans using the API, or in the Stripe 
*/

module.exports.update_plan = function(id, reqData, callback) {
	stripe.plans.update(id, reqData, function (err, plan) {
		if (err) {
			console.log("update_plan=>", err);
			callback(err, null);
		}
		else {
			callback(null, plan);
		}
	});
}

/*
Retrieve a plan
Retrieves the plan with the given ID.
*/
module.exports.retrieve_plan = function(id, callback) {
	stripe.plans.retrieve(id, function (err, plan) {
		if (err) {
			console.log("retrieve_plan=>", err);
			callback(err, null);
		} else {
			callback(null, plan);
		}
	});
}

/*
Delete a plan
You can delete plans using the API, or in the Stripe Dashboard.
Deleting plans means new subscribers can’t be added. Existing subscribers aren’t affected.
*/
module.exports.delete_plan = function(id, callback) {
	stripe.plans.del(id,function (err, confirmation) {
		if (err) {
			console.log("delete_plan=>", err);
			callback(err, null);
		}	else {
			callback(null, confirmation);
		}
	});
}

/*
List all plans
Returns a list of your plans.
*/
module.exports.list_plans = function(callback) {
	stripe.plans.list(function (err, plans) {
		if (err) {
			console.log('list_plans=>', err);
			callback(err, null);
		}	else {
			callback(null, plans);
		}
	});
}