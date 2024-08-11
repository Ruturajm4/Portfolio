import "./App.css";
import { Input } from "@/components/ui/input"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages copy/Login"
import HomePage from "./pages copy/HomePage";



const  App = ()=> {
  
  return (
    
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
         
         
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
   
  )
}

export default App;
