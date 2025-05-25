// CalorieEntryForm.js
import React, { useState } from 'react';
import { useAddCalorieEntryMutation, useGetFoodItemsQuery } from '../store/apiSlice';

const CalorieEntryForm = () => {
  const [foodItemId, setFoodItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: foodItems, isLoading: isLoadingFoodItems, isError: isErrorFoodItems, error: errorFoodItems } = useGetFoodItemsQuery();
  const [addCalorieEntry, { isLoading: isAddingEntry, isError: isErrorEntry, error: errorEntry }] = useAddCalorieEntryMutation();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodItemId) {
      alert("Please select a food item.");
      return;
    }

    let uploadedImageUrl = null;
    if (imageFile) {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload-image', { // Assuming this is your backend endpoint
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`, // Add authorization token
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Image upload failed');
        }
        const result = await response.json();
        uploadedImageUrl = result.imageUrl;
      } catch (uploadError) {
        console.error("Failed to upload image: ", uploadError);
        alert(`Image upload failed: ${uploadError.message}`);
        setIsUploadingImage(false);
        return; // Stop submission if image upload fails
      } finally {
        setIsUploadingImage(false);
      }
    }

    try {
      await addCalorieEntry({ 
        foodItemId, 
        quantity: Number(quantity),
        imageUrl: uploadedImageUrl // Include the image URL if available
      }).unwrap();
      
      // Reset form
      setFoodItemId('');
      setQuantity(1);
      setImageFile(null);
      setImagePreview('');
      // Optionally, display a success message
      alert('Calorie entry logged successfully!');
    } catch (err) {
      console.error("Failed to log calorie entry: ", err);
      // Error is handled by isErrorEntry and errorEntry state from the hook for addCalorieEntry
    }
  };

  if (isLoadingFoodItems) return <p className="text-gray-500">Loading food items for form...</p>;
  if (isErrorFoodItems) return <p className="text-red-500">Error loading food items: {errorFoodItems?.data?.message || errorFoodItems?.status}</p>;

  return (
    <div className="border-2 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-3">Log Calorie Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="foodItem" className="block text-sm font-medium text-gray-700">Food Item</label>
          <select
            id="foodItem"
            name="foodItem"
            value={foodItemId}
            onChange={(e) => setFoodItemId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select a food item</option>
            {foodItems && foodItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.calories} kcal)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0.1"
            step="0.1"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Meal Image (Optional)</label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-md shadow-sm"/>
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={isAddingEntry || isLoadingFoodItems || isUploadingImage || !foodItems || foodItems.length === 0} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
        >
          {isUploadingImage ? 'Uploading Image...' : (isAddingEntry ? 'Logging Entry...' : 'Log Entry')}
        </button>
        {isErrorEntry && <p className="text-red-500 text-xs mt-2">Error: {errorEntry?.data?.message || 'Failed to log entry'}</p>}
        {(!foodItems || foodItems.length === 0) && !isLoadingFoodItems && <p className="text-yellow-500 text-xs mt-2">No food items available to log. Please add some food items first.</p>}
      </form>
    </div>
  );
};

export default CalorieEntryForm;
