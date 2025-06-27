import React from "react";

// set the defaults
const CartContext = React.createContext({
    cartItems:0,
    setCartItems: () => {}
});

export default CartContext;
