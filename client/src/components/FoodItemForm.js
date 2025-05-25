// FoodItemForm.js
import React, { useState } from 'react';
import { useAddFoodItemMutation } from '../store/apiSlice'; // Corrected import path

const FoodItemForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: ''
  });
  const [addFoodItem, { isLoading, isError, error }] = useAddFoodItemMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFoodItem(formData).unwrap();
      setFormData({ name: '', calories: '', protein: '', carbohydrates: '', fat: '' });
      // Optionally, display a success message
    } catch (err) {
      // Error is handled by isError and error state from the hook
      console.error("Failed to add food item: ", err);
    }
  };

  return (
    <div className="border-2 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-3">Add Food Item</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
          <input type="number" name="calories" id="calories" value={formData.calories} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
          <input type="number" name="protein" id="protein" value={formData.protein} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="carbohydrates" className="block text-sm font-medium text-gray-700">Carbohydrates (g)</label>
          <input type="number" name="carbohydrates" id="carbohydrates" value={formData.carbohydrates} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="fat" className="block text-sm font-medium text-gray-700">Fat (g)</label>
          <input type="number" name="fat" id="fat" value={formData.fat} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
          {isLoading ? 'Adding...' : 'Add Food Item'}
        </button>
        {isError && <p className="text-red-500 text-xs mt-2">Error: {error?.data?.message || 'Failed to add item'}</p>}
      </form>
    </div>
  );
};

export default FoodItemForm;
