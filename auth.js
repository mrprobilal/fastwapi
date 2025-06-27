import React from "react";

// set the defaults
const AuthContext = React.createContext({
  signIn: (data) => {},
  signOut: () => {},
  signUp: () => {}
});

export default AuthContext;
