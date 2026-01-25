
import './App.css'
import theme from './theme';
// import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import store from "./store";
import AuthProvider from "./context/AuthContext";

const App = ({ children }) => {
  return (
    // <Provider store={store}>
    // <AuthProvider>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
    // </AuthProvider>
    // </Provider>
  );
};

export default App;
