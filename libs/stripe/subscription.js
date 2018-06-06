var stripe = require('stripe')('sk_test_Z5EXtf7uNhmn2Y8CLvptdrRN');

/*
Subscriptions
Subscriptions allow you to charge a customer on a recurring basis.
A subscription ties a customer to a particular plan you've created.

Useful Links : 
1. https://stripe.com/docs/subscriptions/discounts
2. https://stripe.com/docs/api/node#update_subscription

*/
/*
Create a subscription
Creates a new subscription on an existing customer.

reqData = {
  customer: "cus_91elFtZU3tt11g",
  coupon: "free-period",
  tax_percent: 6.34,
  trial_end: 1516784487,
  items: [
    {
      plan: "basic-monthly",
    },
    {
      plan: "additional-license",
      quantity: 2,
    },
  ]
}
*/
module.exports.create_subscription = function(reqData,callback) {
	stripe.subscriptions.create(reqData, function(err, subscription) {
	    if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(subscription);
	  		callback(null,subscription);
	  	}
	  }
	);
}
/*
Retrieve a subscription
Retrieves the subscription with the given ID
*/
module.exports.retrieve_subscription = function(subscription_id,callback)
{	
	stripe.subscriptions.retrieve(
  	subscription_id,
  	function(err, subscription) {
	   	if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(subscription);
	  		callback(null,subscription);
	  	}
	  }
	);
}
/*
Update a subscription
Updates an existing subscription to match the specified parameters. When changing plans or quantities,
we will optionally prorate the price we charge next month to make up for any price changes. 
To preview how the proration will be calculated, use the upcoming invoice endpoint.

reqData = 

*/
function update_subscription(subscription_id,reqData,callback)
{	
	stripe.subscriptions.update(
	  subscription_id,
	  reqData,
	  function(err, subscription) {
	    if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(subscription);
	  		callback(null,subscription);
	  	}
	  }
	);
}
/*
Cancel a subscription
Cancels a customer’s subscription. If you set the at_period_end parameter to true, 
the subscription will remain active until the end of the period, at which point it will be canceled 
and not renewed. By default, the subscription is terminated immediately. In either case, the customer
will not be charged again for the subscription. Note, however, that any pending invoice items that you’ve 
created will still be charged for at the end of the period unless manually deleted. If you’ve set the 
subscription to cancel at period end, any pending prorations will also be left in place and collected at 
the end of the period, but if the subscription is set to cancel immediately, pending prorations will be removed.

By default, all unpaid invoices for the customer will be closed upon subscription cancellation. 
We do this in order to prevent unexpected payment attempts once the customer has canceled a subscription. 
However, you can reopen the invoices manually after subscription cancellation to have us proceed with payment 
collection, or you could even re-attempt payment yourself on all unpaid invoices before allowing the customer
to cancel the subscription at all.
*/
	
function cancel_subscription(subscription_id,callback)
{
	stripe.subscriptions.del(
	  subscription_id,
	  function(err, confirmation) {
	    if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(confirmation);
	  		callback(null,confirmation);
	  	}
	  }
	);
}
/*
List subscriptions
By default, returns a list of subscriptions that have not been canceled.
In order to list canceled subscriptions, specify status=canceled
*/
	
function list_subscriptions(reqData,callback)
{
	stripe.subscriptions.list(reqData,function(err, subscriptions) {
	  	if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(subscriptions);
	  		callback(null,subscriptions);
	  	}	  
	  });
}
//-----------Code Ends Here ------------------


//********************Don't Edit*********************************
/* subscription example Response
{
  "id": "sub_C9RjgfKu6EGuRS",
  "object": "subscription",
  "application_fee_percent": null,
  "billing": "subscriptions_automatically",
  "cancel_at_period_end": false,
  "canceled_at": null,
  "created": 1516164461,
  "current_period_end": 1521262061,
  "current_period_start": 1518842861,
  "customer": "cus_C9RjMTeUPiYZEa",
  "days_until_due": null,
  "discount": null,
  "ended_at": null,
  "items": {
    "object": "list",
    "data": [
      {
        "id": "si_C9RjO83M7lG5x4",
        "object": "subscription_item",
        "created": 1516164461,
        "metadata": {
        },
        "plan": {
          "id": "silver-express-898",
          "object": "plan",
          "amount": 999,
          "created": 1506381458,
          "currency": "usd",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {
          },
          "name": "Silver Express",
          "statement_descriptor": null,
          "trial_period_days": null
        },
        "quantity": 1
      }
    ],
    "has_more": false,
    "total_count": 1,
    "url": "/v1/subscription_items?subscription=sub_C9RjgfKu6EGuRS"
  },
  "livemode": false,
  "metadata": {
  },
  "plan": {
    "id": "silver-express-898",
    "object": "plan",
    "amount": 999,
    "created": 1506381458,
    "currency": "usd",
    "interval": "month",
    "interval_count": 1,
    "livemode": false,
    "metadata": {
    },
    "name": "Silver Express",
    "statement_descriptor": null,
    "trial_period_days": null
  },
  "quantity": 1,
  "start": 1516164461,
  "status": "active",
  "tax_percent": null,
  "trial_end": null,
  "trial_start": null
}

*/