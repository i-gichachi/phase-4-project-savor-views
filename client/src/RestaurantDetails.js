import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './RestaurantDetails.css';  //Importing styles specific to this component.

//Defines the RestaurantDetails functional component.
function RestaurantDetails() {
    //Using useParams to extract 'id' from the URL and rename it as 'restaurantId'.
    const { id: restaurantId } = useParams();

    //State variables for managing the restaurant details, login status, loading status, and potential errors.
    const [restaurant, setRestaurant] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    //Using the useNavigate hook to get the 'navigate' function for programmatic navigation.
    const navigate = useNavigate();

    //useEffect hook for fetching restaurant details and user authentication status.
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                //Fetch restaurant details.
                const restaurantRes = await fetch(`/restaurants/${restaurantId}`, {
                    credentials: 'include'
                });

                //If the response is not OK, throw an error.
                if (!restaurantRes.ok) {
                    throw new Error(`HTTP error! Status: ${restaurantRes.status}`);
                }
                
                //Convert restaurant details response to JSON.
                const restaurantData = await restaurantRes.json();
                setRestaurant(restaurantData);

                //Fetch user authentication status.
                const userRes = await fetch('/auth', {
                    credentials: 'include'
                });

                //If the user is authenticated, set the isLoggedIn state to true.
                if (userRes.ok) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                //If there's an error in any of the fetch operations, capture it in the error state.
                setError(err);
            } finally {
                //Once all operations are done, set the loading state to false.
                setIsLoading(false);
            }
        }

        //Invoke the fetchData function.
        fetchData();
    }, [restaurantId]);

    //Function to handle clicking the 'Post Review' button.
    const handlePostReviewClick = () => {
        if (isLoggedIn) {
            navigate(`/restaurants/${restaurantId}/reviews/new `);
        } else {
            alert('You need to log in to post a review!');
        } 

    };

    //Function to handle clicking the 'Previous Reviews' button.
    const handlePreviousReviewClick = () => {
        navigate(`/restaurants/${restaurantId}/reviews`);
    };

    //Display a loading message if data is still being fetched.
    if (isLoading) return <div>Loading...</div>;
    //Display an error message if there was a problem fetching the data.
    if (error) return <div>Error loading details: {error.message}</div>;

    return (
        <div>
            {restaurant && (
                <div className="restaurant-card">
                    <img src={restaurant.image} alt={restaurant.name} />
                    <p><strong>Name:</strong> {restaurant.name}</p>
                    <p><strong>Description:</strong> {restaurant.description}</p>
                    <p><strong>Location:</strong> {restaurant.location}</p>
                    <p><strong>Average Rating:</strong> {restaurant.average_rating.toFixed(1)}</p>
                </div>
            )}
    
            <button onClick={handlePreviousReviewClick}>Previous Reviews</button>
            <button onClick={handlePostReviewClick}>Post Review</button>
        </div>
    );
}

//Export the RestaurantDetails component so it can be used elsewhere.
export default RestaurantDetails;