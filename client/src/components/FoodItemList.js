// FoodItemList.js
import React from 'react';
import { useGetFoodItemsQuery } from '../store/apiSlice'; // Corrected import path

const FoodItemList = () => {
  const { data: foodItems, isLoading, isError, error, isFetching } = useGetFoodItemsQuery();

  if (isLoading || isFetching) return <p className="text-gray-500">Loading food items...</p>;
  if (isError) return <p className="text-red-500">Error loading food items: {error?.data?.message || error?.status}</p>;
  if (!foodItems || foodItems.length === 0) return <p className="text-gray-500">No food items found. Add some!</p>;

  return (
    <div className="mt-6 border-2 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-3">Food Item List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein (g)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs (g)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {foodItems.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.calories}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.protein || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.carbohydrates || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.fat || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodItemList;
