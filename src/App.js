import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'
import Rankings from './components/Rankings';
import UserDetails from './components/UserDetails';
import CreateQuestions from "./components/CreateQuestions";
import CreateQuestions_details from "./components/CreateQuestions_details";
import FooterMenu from './components/FooterMenu';

function App() {
  return (
    <Router>
      <div>
        <header className="text-center py-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Real-time Battle App</h1>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Rankings />} />            
            <Route path="/UserDetails" element={<UserDetails />} />
            <Route path="/CreateQuestions" element={<CreateQuestions />} />
            <Route path="/CreateQuestions_details" element={<CreateQuestions_details />} />
          </Routes>
        </main>
        <FooterMenu />
      </div>
    </Router>
  );
}

export default App;
