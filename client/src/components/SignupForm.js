// client/src/components/SignupForm.js
import React, { useState } from 'react';
import { useSignupMutation } from '../store/apiSlice';
// import { useNavigate } from 'react-router-dom'; // Uncomment when router is set up

const SignupForm = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [signup, { isLoading, error, data: signupData }] = useSignupMutation();
  // const navigate = useNavigate(); // Uncomment when router is set up

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await signup(formData).unwrap();
      console.log('Signed up successfully:', userData);
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({ userId: userData.userId, username: userData.username }));
        // navigate('/'); // Redirect to dashboard - Uncomment when router is set up
        alert('Signup successful! You can now login or be redirected.'); // Placeholder for navigation
        window.location.reload(); // Temporary for state update until proper routing/state management
      }
    } catch (err) {
      console.error('Failed to signup:', err);
      // Error is already available in 'error' from the hook
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username_signup" className="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" name="username" id="username_signup" value={formData.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="email_signup" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email_signup" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="password_signup" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" id="password_signup" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        {error && <p className="text-red-500 text-xs mt-2">Error: {error.data?.message || 'Failed to sign up'}</p>}
        {signupData && !error && <p className="text-green-500 text-xs mt-2">Signup successful! Please login.</p>}
      </form>
    </div>
  );
};

export default SignupForm;
