// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); // Redirect to login page
    // No need for window.location.reload() if components re-render based on auth state
  };

  return (
    <nav className="bg-slate-800 text-white p-4 mb-10 rounded">
      <div className="container mx-auto max-w-6xl flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to="/">Levelup Tracker</Link>
        </div>
        <div className="space-x-2"> {/* Reduced spacing for more links */}
          {token && user ? (
            <>
              <span className="text-lg mr-3">Hi, {user.username}!</span>
              <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link to="/manage-expenses" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Manage Expenses</Link>
              <Link to="/manage-calories" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Manage Calories</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
              <Link to="/signup" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
