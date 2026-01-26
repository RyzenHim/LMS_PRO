import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
// import { Provider } from "react-redux";
// import store from "./store";
// import AuthProvider from "./context/AuthContext";

const App = ({ children }) => {


  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>

  );
};

export default App;
