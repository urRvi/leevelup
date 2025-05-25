import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseURI= 'http://localhost:8080';

// Prepare base query to include token if available
const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: baseURI,
    prepareHeaders: (headers, { getState }) => {
        // Attempt to get the token from localStorage (or Redux state)
        const token = localStorage.getItem('token'); // Or: getState().auth.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice= createApi({
    baseQuery: baseQueryWithAuth, // Use the modified base query
    tagTypes: ['categories', 'transaction', 'fooditems', 'calorieentries', 'User'], // Added User tag
    endpoints: builder=>({
        getCategories: builder.query({
            //get: http://localhost:8080/api/categories
            query: ()=>'/api/categories',
            providesTags:['categories']
        }),
        getLables: builder.query({
            query: ()=>'/api/labels',
            providesTags:['transaction']
        }),

        addTransaction: builder.mutation({
            query: (initialTransaction)=>({
                url:'/api/transaction',
                method: "POST",
                body: initialTransaction
            }),
            invalidatesTags:['transaction']
        }),
        deleteTransaction: builder.mutation({
            query: recordId=>({
                url:'/api/transaction',
                method:"DELETE",
                body:recordId
            }),
            invalidatesTags:['transaction']
        }),

        // Food Item Endpoints
        getFoodItems: builder.query({
            // GET: /api/fooditems
            query: () => '/api/fooditems',
            providesTags: ['fooditems']
        }),
        addFoodItem: builder.mutation({
            // POST: /api/fooditems
            query: (initialFoodItem) => ({
                url: '/api/fooditems',
                method: "POST",
                body: initialFoodItem
            }),
            invalidatesTags: ['fooditems']
        }),

        // Calorie Entry Endpoints
        getCalorieEntries: builder.query({
            // GET: /api/calorieentries
            query: () => '/api/calorieentries',
            providesTags: ['calorieentries']
        }),
        addCalorieEntry: builder.mutation({
            // POST: /api/calorieentries
            query: (initialCalorieEntry) => ({
                url: '/api/calorieentries',
                method: "POST",
                body: initialCalorieEntry
            }),
            invalidatesTags: ['calorieentries']
        }),
        deleteCalorieEntry: builder.mutation({
            // DELETE: /api/calorieentries/:id
            query: (entryId) => ({
                url: `/api/calorieentries/${entryId}`,
                method: "DELETE"
                // No body needed for DELETE by ID in the URL
            }),
            invalidatesTags: ['calorieentries']
        }),

        // Auth Endpoints
        signup: builder.mutation({
            query: (credentials) => ({
                url: '/api/auth/signup',
                method: 'POST',
                body: credentials,
            }),
            // Optionally, you might want to invalidate or update user-related tags or data
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: credentials,
            }),
            // On successful login, the token will be handled by the component/authSlice
            // This mutation could also trigger updates to user-specific data if needed
        }),
        logout: builder.mutation({ // Placeholder, actual logout is client-side token removal
            query: () => ({
                url: '/api/auth/logout', // If you have a server-side logout endpoint
                method: 'POST',
            }),
        }),
    })
})

// Export hooks for usage in components
export const {
    useGetCategoriesQuery,
    useGetLablesQuery,
    useAddTransactionMutation,
    useDeleteTransactionMutation,
    useGetFoodItemsQuery,
    useAddFoodItemMutation,
    useGetCalorieEntriesQuery,
    useAddCalorieEntryMutation,
    useDeleteCalorieEntryMutation,
    useSignupMutation,
    useLoginMutation,
    useLogoutMutation, // Exported for completeness
} = apiSlice;

export default apiSlice;