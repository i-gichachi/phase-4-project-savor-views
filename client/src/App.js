import React, { useState } from 'react';  //Imports React and useState hook from the 'react' library.
import { Route, Routes } from 'react-router-dom';  //Imports routing components from 'react-router-dom' library.
import Navbar from './Navbar';  //Imports Navbar component.
import RestaurantsList from './RestaurantList';  //Imports RestaurantsList component.
import RestaurantDetails from './RestaurantDetails';  //Imports RestaurantDetails component.
import ReviewCard from './ReviewCard';  //Imports ReviewCard component.
import ReviewForm from './ReviewForm';  //Imports ReviewForm component.
import Login from './Login';  //Imports Login component.
import Signup from './Signup';  //Imports Signup component.
import Logout from './Logout';  //Imports Logout component.

function App() {
    
    //Initializes state for userEmail. 
    //If there's an email stored in the sessionStorage, uses that as the initial value.
    const [userEmail, setUserEmail] = useState(sessionStorage.getItem('userEmail'));
    
    //Determines if a user is logged in based on whether userEmail is truthy (non-empty).
    const isLoggedIn = !!userEmail;

    //Function to handle successful login
    const handleLoginSuccess = (email) => {
        setUserEmail(email);  //Updates userEmail state with the provided email.
    };

    //Function to handle logout
    const handleLogout = () => {
        sessionStorage.removeItem('userEmail');  //Removes userEmail from sessionStorage.
        setUserEmail(null);  //Clears userEmail state.
    };

    return (
        <div className="App">
            {/* Navbar component, passing isLoggedIn and userEmail as props */}
            <Navbar isLoggedIn={isLoggedIn} userEmail={userEmail} />

            {/* Define application routes using the Routes component */}
            <Routes>
                {/* Home route which renders the RestaurantsList component */}
                <Route path="/" element={<RestaurantsList />} />

                {/* Dynamic route to show details of a specific restaurant */}
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />

                {/* Dynamic route to show reviews for a specific restaurant */}
                <Route path="/restaurants/:id/reviews" element={<ReviewCard />} />

                {/* Dynamic route to post a review for a specific restaurant */}
                <Route path="/restaurants/:restaurantId/reviews/new" element={<ReviewForm />}/>

                {/* Route for login, passing the handleLoginSuccess function as a prop */}
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

                {/* Route for signup */}
                <Route path="/signup" element={<Signup />} />

                {/* Route for logout, passing the handleLogout function as a prop */}
                <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
            </Routes>
        </div>
    );
}

//Exports the App component so it can be used elsewhere in the application.
export default App;