import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantList.css';  //Importing styles specific to this component.

//Define the RestaurantsList functional component.
function RestaurantsList() {
    //State variable to manage the list of restaurants.
    const [restaurants, setRestaurants] = useState([]);
    //Using the useNavigate hook to get the 'navigate' function for programmatic navigation.
    const navigate = useNavigate();

    //useEffect hook to fetch the list of restaurants.
    useEffect(() => {
        //Define the async function to fetch restaurant data.
        const fetchData = async () => {
            try {
                //Send a GET request to the '/restaurants' endpoint.
                const response = await fetch('/restaurants');
                //Convert the response to JSON format.
                const data = await response.json();
                //Set the received data to the restaurants state.
                setRestaurants(data);
            } catch (error) {
                //If there's an error in fetching, log it to the console.
                console.error("Error fetching restaurants:", error);
            }
        };

        //Invoke the fetchData function.
        fetchData();
    }, []); //The empty dependency array ensures that this useEffect runs only once after the component mounts.

    //Function to handle the click event of 'View Details' button for a restaurant.
    const handleViewDetails = (restaurantId) => {
        //Navigate to the restaurant details page for the clicked restaurant.
        navigate(`/restaurant/${restaurantId}`);
    };

    return (
        <div className="restaurants-container">
            {/* Iterate over the 'restaurants' array and render each restaurant's details. */}
            {restaurants.map(restaurant => (
                <div className="restaurant-card" key={restaurant.id}>
                    <img src={restaurant.image} alt={restaurant.name} className="restaurant-image"/>
                    <div className="restaurant-info">
                        <h2>Name: {restaurant.name}</h2>
                        <p>Location: {restaurant.location}</p>
                        {/* 'View Details' button that, when clicked, navigates to the specific restaurant's details page. */}
                        <button onClick={() => handleViewDetails(restaurant.id)} className="details-button">View Details</button>
                    </div>
                </div>
            ))}
        </div>
    );    
}

//Export the RestaurantsList component so it can be used elsewhere.
export default RestaurantsList;