// client/src/components/LoginForm.js
import React, { useState } from 'react';
import { useLoginMutation } from '../store/apiSlice';
// import { useNavigate } from 'react-router-dom'; // Uncomment when router is set up
// import { useDispatch } from 'react-redux'; // Uncomment if using Redux for state management
// import { setCredentials } from '../store/authSlice'; // Uncomment if using Redux for state management

const LoginForm = () => {
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [login, { isLoading, error, data: loginData }] = useLoginMutation();
  // const navigate = useNavigate(); // Uncomment when router is set up
  // const dispatch = useDispatch(); // Uncomment if using Redux for state management

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(formData).unwrap();
      console.log('Logged in successfully:', userData);
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({ userId: userData.userId, username: userData.username }));
        // dispatch(setCredentials(userData)); // Uncomment if using Redux for state management
        // navigate('/'); // Redirect to dashboard - Uncomment when router is set up
        alert('Login successful! You will be redirected.'); // Placeholder for navigation
        window.location.reload(); // Temporary for state update until proper routing/state management
      }
    } catch (err) {
      console.error('Failed to login:', err);
      // Error is already available in 'error' from the hook
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emailOrUsername_login" className="block text-sm font-medium text-gray-700">Email or Username</label>
          <input type="text" name="emailOrUsername" id="emailOrUsername_login" value={formData.emailOrUsername} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="password_login" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" id="password_login" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-500 text-xs mt-2">Error: {error.data?.message || 'Failed to login'}</p>}
        {loginData && !error && <p className="text-green-500 text-xs mt-2">Login successful!</p>}
      </form>
    </div>
  );
};

export default LoginForm;
