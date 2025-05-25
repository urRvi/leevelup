import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Graph from './components/Graph';
import Form from './components/Form';
import FoodItemForm from './components/FoodItemForm';
import FoodItemList from './components/FoodItemList';
import CalorieEntryForm from './components/CalorieEntryForm';
import CalorieEntryList from './components/CalorieEntryList';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Navbar from './components/Navbar'; // Import Navbar

// Helper to check authentication status (e.g., by checking for token in localStorage)
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import Dashboard from './components/Dashboard'; // Import Dashboard

// Main application layout component (Old: will be replaced by Dashboard as main view)
// const MainAppLayout = () => (
//   <div className='container mx-auto max-w-6xl text-center drop-shadow-lg text-gray-800'>
//     {/* Expense Tracker */}
//     <div className='grid md:grid-cols-2 gap-4'>
//       <Graph />
//       <Form />
//     </div>

//     {/* Calorie Tracker - New Section */}
//     <div className='mt-10'>
//       <h2 className='text-2xl py-4 bg-slate-700 text-white rounded'>Calorie Tracker</h2>
//       <div className='grid md:grid-cols-2 gap-4 mt-4'>
//         <div>
//           <FoodItemForm />
//           <FoodItemList />
//         </div>
//         <div>
//           <CalorieEntryForm />
//           <CalorieEntryList />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// Define routes for individual tracker management pages
const ExpenseManagementPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Manage Expenses</h1>
    <div className='grid md:grid-cols-2 gap-4'>
      <Graph />
      <Form />
    </div>
  </div>
);

const CalorieManagementPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Manage Calorie Entries</h1>
    <div className='grid md:grid-cols-2 gap-4'>
      <div>
        <FoodItemForm />
        <FoodItemList />
      </div>
      <div>
        <CalorieEntryForm />
        <CalorieEntryList />
      </div>
    </div>
  </div>
);


function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar /> {/* Navbar will be displayed on all pages */}
        <Routes>
          <Route path="/login" element={isAuthenticated() ? <Navigate to="/" /> : <LoginForm />} />
          <Route path="/signup" element={isAuthenticated() ? <Navigate to="/" /> : <SignupForm />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard /> {/* Dashboard is now the main authenticated view */}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-expenses" 
            element={
              <ProtectedRoute>
                <ExpenseManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-calories" 
            element={
              <ProtectedRoute>
                <CalorieManagementPage />
              </ProtectedRoute>
            } 
          />
          {/* Redirect any other path to login or home depending on auth state */}
          <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
