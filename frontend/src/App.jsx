// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Parser from './pages/Parser';
import Comparison from './pages/Comparison';
import Generation from './pages/Generation';
import Validation from './pages/Validation';
import Inspector from './pages/Inspector';

// Define a simple Home component as a placeholder (optional, can be removed if Parser is the main landing)
const Home = () => (
  <div className="text-center text-xl font-semibold text-gray-700">
    Welcome to the Data Parser & Generator Application!
    <p className="mt-4 text-base text-gray-600">Use the navigation bar above to explore the features.</p>
  </div>
);


const Colors = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  darkGray: 'text-gray-700',
  lightGray: 'bg-gray-50',
  secondary: 'bg-blue-100',
  textSecondary: 'text-gray-600',
};

const App = () => {
  return (
    <Router>
      <div className={`min-h-screen font-sans ${Colors.lightGray} text-gray-800`}>
        {/* Header */}
        <header className={`py-4 shadow-md ${Colors.blue} text-white`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Data Parser & Generator</h1>
            {/* You could add a logo here */}
          </div>
        </header>

        {/* Navbar */}
        <nav className={`py-2 shadow-sm ${Colors.secondary} ${Colors.darkGray}`}>
          <div className="container mx-auto px-6">
            {/* Ensure flex and justify-center for centering */}
            <ul className="flex space-x-4 md:space-x-6 justify-center">
              <li>
                <Link
                 
                  to="/"
                  className="inline-block text-lg text-gray-700 hover:bg-blue-200 rounded py-2 px-3 transition-colors no-underline"
                >
                  Parser {/* Assuming Parser is the default/home page */}
                </Link>
              </li>
              <li>
                <Link
                  
                  to="/comparison"
                  className="inline-block text-lg text-gray-700 hover:bg-blue-200 rounded py-2 px-3 transition-colors no-underline"
                >
                  Data-Comparison
                </Link>
              </li>
              <li>
                <Link
                 
                  to="/inspector"
                  className="inline-block text-lg text-gray-700 hover:bg-blue-200 rounded py-2 px-3 transition-colors no-underline"
                >
                  Inspector
                </Link>
              </li>
              <li>
                <Link
                 
                  to="/validation"
                  className="inline-block text-lg text-gray-700 hover:bg-blue-200 rounded py-2 px-3 transition-colors no-underline"
                >
                  SchemaValidation
                </Link>
              </li>
{/*               <li>
                <Link
                
                  to="/generation"
                  className="inline-block text-lg text-gray-700 hover:bg-blue-200 rounded py-2 px-3 transition-colors no-underline"
                >
                  Data-Generator
                </Link>
              </li> */}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="container mx-auto py-8 px-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Routes>
              {/* CORRECTED: Set the default route to Parser */}
              <Route path="/" element={<Parser />} />
              <Route path="/parser" element={<Parser />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/generation" element={<Generation />} />
              <Route path="/validation" element={<Validation />} />
              <Route path="/inspector" element={<Inspector />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className={`py-4 mt-8 shadow-inner ${Colors.blue} ${Colors.textSecondary}`}> {/* CORRECTED: Use Colors variable */}
          <div className="container mx-auto px-6 text-center text-sm">
            <p>&copy; 2025 Data Parser & Data Generation</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
