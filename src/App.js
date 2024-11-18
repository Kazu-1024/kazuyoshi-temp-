import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import Login from './components/login/Login';
import Home from './components/Home';
import InGame from './components/inGame/InGame';
import Rankings from './components/Rankings';
import QuizReview from "./components/QuizReview";
import UserDetails from './components/UserDetails';
import Matching from "./components/matching/Matching";
import CreateQuestions from "./components/CreateQuestions";
import CreateQuestions_details from "./components/CreateQuestions_details";
// import Header from "./components/layout/header";
import FooterMenu from './components/layout/FooterMenu';

function App() {
  const location = useLocation();

  const hideFooterPaths = ["/InGame", "/Login"];
  return (
      <>
        <div className="flex flex-col min-h-screen h-screen">
          <header className="text-center py-4 bg-gray-800 text-white">
            <h1 className="text-2xl font-bold">Luxon</h1>
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/Login" element={<Login />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/QuizReview" element={<QuizReview />} />
              <Route path="/" element={<Home />} />
              <Route path="/rankings" element={<Rankings />} />            
              <Route path="/UserDetails" element={<UserDetails />} />
              <Route path="/Matching" element={<Matching />} />
              <Route path="/InGame" element={<InGame />} />
              <Route path="/CreateQuestions" element={<CreateQuestions />} />
              <Route path="/CreateQuestions_details" element={<CreateQuestions_details />} />
            </Routes>
          </main>
          {!hideFooterPaths.includes(location.pathname) && (
            <footer className="bg-cyan-400 absolute bottom-0 flex justify-around w-full py-5">
              <FooterMenu />
            </footer>
          )}
        </div>
      </>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
