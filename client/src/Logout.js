import React, { useState, useEffect } from 'react';  //Import React and the hooks: useState and useEffect.
import { useNavigate } from 'react-router-dom';  //Import the useNavigate hook for programmatic navigation.
import './Logout.css'  //Import styles for this component.

function Logout({ onLogout }) {  //The Logout component receives a prop: onLogout function.
    const navigate = useNavigate();  //Hook to programmatically navigate.
    const [csrfToken, setCsrfToken] = useState(null);  //Initialize the state for CSRF token.
    const [showConfirm, setShowConfirm] = useState(false);  //State to manage visibility of logout confirmation dialog.

    useEffect(() => {
        //Function to fetch the CSRF token on component mount.
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/csrf_token');  //Fetch CSRF token from the backend.
                const data = await response.json();  //Convert response to JSON.
                setCsrfToken(data.token);  //Set the CSRF token in the state.
            } catch (error) {
                console.error('Failed to fetch CSRF token:', error);  //Log error if CSRF token fetch fails.
            }
        };

        fetchCsrfToken();  //Call the function to initiate the fetch.
    }, []);  //Empty dependency array means useEffect runs once on component mount.

    //Handle logout action.
    const handleLogout = async () => {
        if (!csrfToken) {
            console.error('CSRF token not available');  //Log error if CSRF token is missing.
            return;
        }

        try {
            //Sends a request to the '/logout' endpoint to log the user out.
            const response = await fetch('/logout', { 
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken  //Passes the CSRF token in headers.
                }
            });

            if (response.status === 200) {  //If logout is successful:
                sessionStorage.removeItem('userEmail');  //Removes the user email from session storage.
                if (onLogout) onLogout();  //If onLogout callback is provided, call it.
                navigate('/');  //Navigate to home.
            } else if (response.status === 401) {  //Handle unauthorized request.
                console.error('Unauthorized request. Please login again.');
                navigate('/');  //Navigate to home, possibly to show login page.
            } else {
                console.error('Failed to log out.');
            }
        } catch (error) {
            console.error('An error occurred:', error);  //Log any unexpected error.
        }

        setShowConfirm(false);  //Close the confirmation dialog, irrespective of success or failure.
    };

    //Show logout confirmation dialog.
    const openConfirmDialog = () => {
        setShowConfirm(true);  //Change state to show the dialog.
    };

    //Close logout confirmation dialog without logging out.
    const closeConfirmDialog = () => {
        setShowConfirm(false);  //Change state to hide the dialog.
    };

    return (
        <div>
            {/* Button to initiate the logout process */}
            <button onClick={openConfirmDialog}>Logout</button>

            {/* Conditional rendering of the confirmation dialog based on the 'showConfirm' state */}
            {showConfirm && (
                <div className="confirm-dialog">
                    <p>Are you sure you want to logout?</p>
                    <button onClick={handleLogout}>OK</button>  {/* Button to confirm logout */}
                    <button onClick={closeConfirmDialog}>Cancel</button>  {/* Button to cancel logout */}
                </div>
            )}
        </div>
    );
}

export default Logout;  //Export the Logout component for use in other parts of the application.