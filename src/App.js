import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login/Login';
import Home from './components/Home';
import Rankings from './components/Rankings';
import QuizReview from "./components/QuizReview";
import UserDetails from './components/UserDetails';
import CreateQuestions from "./components/CreateQuestions";
import CreateQuestions_details from "./components/CreateQuestions_details";
import FooterMenu from './components/FooterMenu';

function App() {
  return (
    <Router>
      <>
      <div className="flex flex-col h-screen">
        <header className="text-center py-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Luxon</h1>
        </header>
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/Login" element={<Login />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/QuizReview" element={<QuizReview />} />
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Rankings />} />            
            <Route path="/UserDetails" element={<UserDetails />} />
            <Route path="/CreateQuestions" element={<CreateQuestions />} />
            <Route path="/CreateQuestions_details" element={<CreateQuestions_details />} />
          </Routes>
        </main>
        <footer className="bg-cyan-400 absolute bottom-0 flex justify-around w-full py-5">
          <FooterMenu />
        </footer>
        </div>
      </>
    </Router>
  );
}

export default App;
