// CalorieEntryList.js
import React from 'react';
import { useGetCalorieEntriesQuery, useDeleteCalorieEntryMutation } from '../store/apiSlice'; // Corrected import path

const CalorieEntryList = () => {
  const { data: calorieEntries, isLoading, isError, error, isFetching } = useGetCalorieEntriesQuery();
  const [deleteCalorieEntry, { isLoading: isDeleting }] = useDeleteCalorieEntryMutation();

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteCalorieEntry(entryId).unwrap();
        // Optionally, display a success message
      } catch (err) {
        console.error("Failed to delete calorie entry: ", err);
        alert(`Failed to delete entry: ${err.data?.message || err.status || 'Server error'}`);
      }
    }
  };

  if (isLoading || isFetching) return <p className="text-gray-500">Loading calorie entries...</p>;
  if (isError) return <p className="text-red-500">Error loading calorie entries: {error?.data?.message || error?.status}</p>;
  if (!calorieEntries || calorieEntries.length === 0) return <p className="text-gray-500">No calorie entries logged yet.</p>;

  return (
    <div className="mt-6 border-2 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-3">Calorie Entry List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calories</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calorieEntries.map((entry) => (
              <tr key={entry._id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.foodItemId?.name || 'Meal image'} className="h-12 w-12 object-cover rounded"/>
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{entry.foodItemId?.name || 'N/A'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{entry.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {entry.foodItemId ? (entry.foodItemId.calories * entry.quantity).toFixed(0) : 'N/A'} kcal
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(entry._id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 disabled:text-red-300"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalorieEntryList;
