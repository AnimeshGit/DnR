var stripe = require('stripe')('sk_test_Z5EXtf7uNhmn2Y8CLvptdrRN');

/*
Charges
To charge a credit or a debit card, you create a charge object.
You can retrieve and refund individual charges as well as list all charges. 
Charges are identified by a unique random ID.

*/
/*
Create a charge
To charge a credit card, you create a Charge object. If your API key is in test mode, 
the supplied payment source (e.g., card) won't actually be charged, though everything else will occur as 
if in live mode.
(Stripe assumes that the charge would have completed successfully).

reqData = {
    amount: 300,
    currency: "usd",
    source: "tok_visa", // obtained with Stripe.js
    metadata: {'order_id': '6735'}
  }
*/
function create_charges(reqData,callback)
{
	stripe.charges.create(reqData,function(err,response){
		if(err){
			console.log("create_charges=>",err);
      callback(err,null);
		}
		else{			
			callback(null,response);
		}
	});
}
/*
Retrieve a charge
Retrieves the details of a charge that has previously been created.
Supply the unique charge ID that was returned from your previous request,
and Stripe will return the corresponding charge information.
The same information is returned when creating or refunding the charge.
*/
function retrieve_charge(charge_id,callback)
{	
	stripe.charges.retrieve(
  charge_id,function(err, charge) {
	  	if(err){
      console.log("retrieve_charge=>",err);
      callback(err,null);
    }
    else{     
      callback(null,charge);
    }
	  
	  });
}
/*
Capture the payment of an existing, uncaptured, charge. This is the second half of the two-step payment flow,
 where first you created a charge with the capture option set to false.

Uncaptured payments expire exactly seven days after they are created. 
If they are not captured by that point in time, they will be marked as refunded and will no longer be capturable.

*/
function capture_charge(charge_id,callback)
{	
	stripe.charges.capture(
  charge_id,function(err, charge) {
	  	if(err){
        console.log("capture_charge=>",err);
        callback(err,null);
      }
      else{     
        callback(null,charge);
      }	  
	  });
}
/*
List all charges
Returns a list of charges you’ve previously created. 
The charges are returned in sorted order, with the most recent charges appearing first.
*/
	
function list_charge(reqData,callback)
{
	stripe.charges.list(reqData,function(err, charge) {
	  	if(err){
      console.log("list_charge =>",err);
      callback(err,null);
    }
    else{     
      callback(null,charge);
    }
	  
	  });
}
/*
Update a charge
Updates the specified charge by setting the values of the parameters passed.
Any parameters not provided will be left unchanged.

This request accepts only the customer, description, fraud_details, metadata, receipt_email, 
and shipping arguments.
*/
	
function update_charge(charge_id,reqData,callback)
{
	stripe.charges.update(
  charge_id,
  reqData,function(err, charge) {
	  	if(err)
	  	{
	  		console.log('update_charge=> ',err);
	  	}
	  	else
	  	{
	  		
	  		callback(null,charge);
	  	}
	  
	  });
}
//-----------Code Ends Here ------------------


//********************Don't Edit*********************************
/* charge example Response
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
}

*/