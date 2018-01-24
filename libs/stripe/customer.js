var stripe = require('stripe')('sk_test_Z5EXtf7uNhmn2Y8CLvptdrRN');

/*
Customer objects allow you to perform recurring charges and track multiple charges that 
are associated with the same customer. The API allows you to create, delete, and update your customers. 
You can retrieve individual customers as well as a list of all your customers.

reqData = {
  description: 'Customer for avery.johnson@example.com',
  source: "tok_mastercard", // obtained with Stripe.js
  email : 'shital.pimpale@eeshana.com'
}
*/

function create_customer(reqData,callback)
{
	stripe.customers.create(reqData, function(err, customer) {
	  	if(err){
      console.log("create_customer=>",err);
      callback(err,null);
      }
      else{     
        callback(null,customer);
      }
	});
}
//*******************************

function retrieve_customer(customer_id,callback)
{	
	stripe.customers.retrieve(
	  customer_id,
	  function(err, customer) {
	  	if(err){
      console.log("retrieve_customer=>",err);
      callback(err,null);
      }
      else{     
        callback(null,customer);
      }
	  
	  });
}
//*************************************
/*
Updates the specified customer by setting the values of the parameters passed.
 Any parameters not provided will be left unchanged. For example, if you pass the source parameter,
  that becomes the customer’s active source (e.g., a card) to be used for all charges in the future. 
  When you update a customer to a new valid source: for each of the customer’s current subscriptions, 
  if the subscription bills automatically and is in the past_due state, then the latest unpaid, 
  unclosed invoice for the subscription will be retried (note that this retry will not count as an automatic retry,
   and will not affect the next regularly scheduled payment for the invoice). 
   (Note also that no invoices pertaining to subscriptions in the unpaid state, or invoices pertaining to canceled
    subscriptions, will be retried as a result of updating the customer’s source.)

This request accepts mostly the same arguments as the customer creation call.

*/	
function update_customer(customer_id,reqData,callback)
{
	stripe.customers.update(customer_id,reqData, function(err, customer) {
	  	if(err){
      console.log("update_customer=>",err);
      callback(err,null);
      }
      else{     
        callback(null,customer);
      }
	  
	  });
}
//********************************************
/*
Permanently deletes a customer.
It cannot be undone. Also immediately cancels any active subscriptions on the customer.
*/
function delete_customer(customer_id,callback)
{
	stripe.customers.del(customer_id, function(err, confirmation) {
	  	if(err){
      console.log("delete_customer=>",err);
      callback(err,null);
      }
      else{     
        callback(null,confirmation);
      }
	  
	  });
});
//********************************************
/*
Returns a list of your customers.
The customers are returned sorted by creation date, with the most recent customers appearing first.

*/
function list_customers(reqData,callback)
{
	stripe.customers.list(reqData,function(err, customer) {
	  	if(err){
      console.log("list_customers=>",err);
      callback(err,null);
      }
      else{     
        callback(null,customer);
      }
	  
	  });
}

//*****************************************************
/* Customer example Response
{
  "object": "list",
  "url": "/v1/charges",
  "has_more": false,
  "data": [
    {
      "id": "ch_1Bj3fEHbXrgIx7VWQnZBFXwH",
      "object": "charge",
      "amount": 300,
      "amount_refunded": 0,
      "application": null,
      "application_fee": null,
      "balance_transaction": "txn_1Bj2fbHbXrgIx7VWgqZ6f0qW",
      "captured": true,
      "created": 1515667924,
      "currency": "usd",
      "customer": null,
      "description": null,
      "destination": null,
      "dispute": null,
      "failure_code": null,
      "failure_message": null,
      "fraud_details": {
      },
      "invoice": null,
      "livemode": false,
      "metadata": {
        "order_id": "6735"
      },
      "on_behalf_of": null,
      "order": null,
      "outcome": {
        "network_status": "approved_by_network",
        "reason": null,
        "risk_level": "normal",
        "seller_message": "Payment complete.",
        "type": "authorized"
      },
      "paid": true,
      "receipt_email": null,
      "receipt_number": null,
      "refunded": false,
      "refunds": {
        "object": "list",
        "data": [
    
        ],
        "has_more": false,
        "total_count": 0,
        "url": "/v1/charges/ch_1Bj3fEHbXrgIx7VWQnZBFXwH/refunds"
      },
      "review": null,
      "shipping": null,
      "source": {
        "id": "card_1Bj3fEHbXrgIx7VWpZdcAzVZ",
        "object": "card",
        "address_city": null,
        "address_country": null,
        "address_line1": null,
        "address_line1_check": null,
        "address_line2": null,
        "address_state": null,
        "address_zip": null,
        "address_zip_check": null,
        "brand": "Visa",
        "country": "US",
        "customer": null,
        "cvc_check": null,
        "dynamic_last4": null,
        "exp_month": 8,
        "exp_year": 2019,
        "fingerprint": "YG5BCUQeDBSG936F",
        "funding": "credit",
        "last4": "4242",
        "metadata": {
        },
        "name": null,
        "tokenization_method": null
      },
      "source_transfer": null,
      "statement_descriptor": null,
      "status": "succeeded",
      "transfer_group": null
    },
    {...},
    {...}
  ]
}

*/