# Testing Plan

## Use case #1 Purchasing onigiri
### Business language scenario

When the user clicks the +- button for each product.\
The number displayed for that product increases or decreases.


When the user clicks "Add to Cart".\
The number of items in the cart increases by the number of items displayed.
The product is added to the cart.


When the user clicks the cart button.\
A list of the products added to the cart is displayed.\
The total price of the registered products is displayed.


When the user presses the Proceed to checkout button after adding products to the cart.\
The payment screen is displayed.


If there are 20 or more items in the cart.\
The list of products added to the cart is displayed on the payment screen.


When the user enters the shipping address information and payment method on the payment screen and presses the "Pay" button.\
The product is paid for and the products added to the cart are deleted.


### AI Prompt
```bash
For Use case #1 please create end-to-end test assuming you are ordering "onigiri".
```

