// client/src/components/Dashboard.js
import React from 'react';
import { 
    useGetLablesQuery, 
    useGetCalorieEntriesQuery, 
    // useGetFoodItemsQuery // Might not be needed if calorie entries are well-populated
} from '../store/apiSlice';
import Graph from './Graph'; // Reusing the existing graph component
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'; // For Line chart
import { Line } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);


const Dashboard = () => {
  const { data: transactionsData, isLoading: isLoadingTransactions, isError: isErrorTransactions, error: errorTransactions } = useGetLablesQuery();
  const { data: calorieEntriesData, isLoading: isLoadingCalories, isError: isErrorCalories, error: errorCalories } = useGetCalorieEntriesQuery();
  // const { data: foodItemsData, isLoading: isLoadingFoodItems, isError: isErrorFoodItems } = useGetFoodItemsQuery(); // If needed

  // Basic loading and error handling
  if (isLoadingTransactions || isLoadingCalories) {
    return <p className="text-center text-gray-500 mt-10">Loading dashboard data...</p>;
  }

  // More specific error handling can be added here
  if (isErrorTransactions) {
    return <p className="text-center text-red-500 mt-10">Error loading financial data: {errorTransactions?.data?.message || 'Unknown error'}</p>;
  }
  if (isErrorCalories) {
    return <p className="text-center text-red-500 mt-10">Error loading calorie data: {errorCalories?.data?.message || 'Unknown error'}</p>;
  }
  
  // Process financial data
  let totalIncome = 0;
  let totalExpenses = 0;
  if (transactionsData) {
    transactionsData.forEach(item => {
      // Assuming 'type' field distinguishes income from expenses
      // And that 'Savings' is considered an expense for this calculation or handled differently
      if (item.type === 'Income') { // This type needs to exist in your categories/transactions
        totalIncome += item.amount;
      } else if (item.type === 'Expenses' || item.type === 'Savings') { // Example types
        totalExpenses += item.amount;
      }
      // If type doesn't clearly define income/expense, this logic needs adjustment
      // For now, the original Graph component sums up all transactions by type for its chart.
      // We'll assume all transactions fetched by getLables are expenses for simplicity if no clear income type.
      // This part might need refinement based on actual data structure for income.
      // If 'Income' type is not present, all will be treated as expenses.
    });
    if (totalIncome === 0 && totalExpenses === 0 && transactionsData.length > 0) {
        // Fallback if no "Income" type, assume all are expenses as per original getLables logic
        transactionsData.forEach(item => totalExpenses += item.amount);
    }
  }
  const netBalance = totalIncome - totalExpenses;

  // Process calorie data for today
  const today = new Date().setHours(0, 0, 0, 0);
  let todaysCalories = 0;
  let todaysProtein = 0;
  let todaysCarbs = 0;
  let todaysFat = 0;
  const last7DaysCalorieData = {};

  if (calorieEntriesData) {
    calorieEntriesData.forEach(entry => {
      const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
      const foodItem = entry.foodItemId; // Populated from backend

      if (foodItem) {
        const calories = foodItem.calories * entry.quantity;
        const protein = (foodItem.protein || 0) * entry.quantity;
        const carbs = (foodItem.carbohydrates || 0) * entry.quantity;
        const fat = (foodItem.fat || 0) * entry.quantity;

        if (entryDate === today) {
          todaysCalories += calories;
          todaysProtein += protein;
          todaysCarbs += carbs;
          todaysFat += fat;
        }

        // For the 7-day trend
        const dateString = new Date(entry.date).toLocaleDateString('en-CA'); // YYYY-MM-DD for sorting
        if (new Date(entry.date) >= new Date(new Date().setDate(new Date().getDate() - 7))) {
            last7DaysCalorieData[dateString] = (last7DaysCalorieData[dateString] || 0) + calories;
        }
      }
    });
  }
  
  const sortedCalorieDates = Object.keys(last7DaysCalorieData).sort();
  const calorieTrendChartData = {
    labels: sortedCalorieDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Calories Consumed',
        data: sortedCalorieDates.map(date => last7DaysCalorieData[date]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Financial Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600 border-b pb-2">Financial Overview</h2>
          <div className="mb-6 space-y-2 text-gray-700">
            <p className="text-lg">Total Income: <span className="font-semibold text-green-600">${totalIncome.toFixed(2)}</span></p>
            <p className="text-lg">Total Expenses: <span className="font-semibold text-red-600">${totalExpenses.toFixed(2)}</span></p>
            <p className="text-lg">Net Balance: <span className={`font-semibold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>${netBalance.toFixed(2)}</span></p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-indigo-500">Expense Breakdown</h3>
            <Graph /> {/* Reusing the Graph component */}
          </div>
        </section>

        {/* Calorie Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">Nutrition Overview</h2>
          <div className="mb-6 space-y-2 text-gray-700">
            <p className="text-lg">Today's Calories: <span className="font-semibold text-green-700">{todaysCalories.toFixed(0)} kcal</span></p>
            <p className="text-md">Protein: <span className="font-medium">{todaysProtein.toFixed(1)}g</span></p>
            <p className="text-md">Carbohydrates: <span className="font-medium">{todaysCarbs.toFixed(1)}g</span></p>
            <p className="text-md">Fat: <span className="font-medium">{todaysFat.toFixed(1)}g</span></p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-500">Calorie Trend (Last 7 Days)</h3>
            {calorieEntriesData && calorieEntriesData.length > 0 ? (
                <Line data={calorieTrendChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Daily Calorie Intake' } } }} />
            ) : (
                <p className="text-gray-500">Not enough data for calorie trend.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
