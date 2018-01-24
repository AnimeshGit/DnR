var stripe = require('stripe')('sk_test_Z5EXtf7uNhmn2Y8CLvptdrRN');

/*
Cards
You can store multiple cards on a customer in order to charge the customer later.
You can also store multiple debit cards on a recipient in order to transfer to those cards later.

Useful Links : 

1. https://stripe.com/docs/api/node#cards

*/
/*
Create a card
When you create a new credit card, you must specify a customer or recipient to create it on.

If the card's owner has no default card, then the new card will become the default. However,
if the owner already has a default then it will not change. To change the default, you should either update 
the customer to have a new default_source or update the recipient to have a new default_card.
*/
function create_card(customer_id,reqData,callback)
{
	stripe.customers.createSource(
	  customer_id,
	  reqData,
	  function(err, card) {
	    if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(card);
	  		callback(null,card);
	  	}
	  }
	);
}
/*
Retrieve a card
You can always see the 10 most recent cards directly on a customer or recipient; this method lets you retrieve details about a specific card stored on the customer or recipient.
*/
function retrieve_card(customer_id,card_id,callback)
{	
	stripe.customers.retrieveCard(
	  customer_id,
	  card_id,
	  function(err, card) {
	  	if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(card);
	  		callback(null,card);
	  	}
	  }
	);
}
/*
Update a card
If you need to update only some card details, like the billing address or expiration date, you can do so without having to re-enter the full card details. Stripe also works directly with card networks so that your customers can continue using your service without interruption.

When you update a card, Stripe will automatically validate the card.

*/
function update_card(customer_id,card_id,reqData,callback)
{	
	stripe.customers.updateCard(
	  customer_id,
	  card_id,
	  reqData,
	  function(err, card) {
	    if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(card);
	  		callback(null,card);
	  	}
	  }
	);
}
/*
Delete a card
You can delete cards from a customer or recipient.

For customers: if you delete a card that is currently the default source, then the most recently added source
will become the new default. If you delete a card that is the last remaining source on the customer then the 
default_source attribute will become null.

For recipients: if you delete the default card, then the most recently added card will become the new default. 
If you delete the last remaining card on a recipient, then the default_card attribute will become null.

Note that for cards belonging to customers, you may want to prevent customers on paid subscriptions from 
deleting all cards on file so that there is at least one default card for the next invoice payment attempt.
*/
	
function delete_card(customer_id,card_id,callback)
{
	stripe.customers.deleteCard(
	  customer_id,
	  card_id,
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
List all cards
You can see a list of the cards belonging to a customer or recipient. Note that the 10 most recent sources are always available on the customer object. If you need more than those 10, 
you can use this API method and the limit and starting_after parameters to page through additional cards.
*/
	
function list_cards(customer_id,callback)
{
	stripe.customers.listCards(customer_id, function(err, cards) {
	  	if(err)
	  	{
	  		callback(err,null);
	  	}
	  	else
	  	{
	  		console.log(cards);
	  		callback(null,cards);
	  	}	  
	  });
}
//-----------Code Ends Here ------------------


//********************Don't Edit*********************************
/* cards example Response
{
  "id": "card_1Bl8poHbXrgIx7VWRmOFlylo",
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
}

*/