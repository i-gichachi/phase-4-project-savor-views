import React from 'react';  //React library.
import { useNavigate, Link } from 'react-router-dom';  //Hooks and components from 'react-router-dom'.
import { FaUser, FaHome } from 'react-icons/fa';  //Import specific icons from 'react-icons/fa'.
import './Navbar.css';  //Import the stylesheet for the Navbar component.

//Defines the Navbar component.
function Navbar({ isLoggedIn, userEmail }) {
    //Using the useNavigate hook to get the 'navigate' function for programmatic navigation.
    const navigate = useNavigate();

    //Extracts the username from the email by splitting at '@' and picking the first part.
    const userName = userEmail ? userEmail.split('@')[0] : null;

    return (
        //Defines the main Navbar container.
        <div className="navbar">
            <div className="title">
                SavorViews
            </div>
            <FaHome className="home-icon" onClick={() => navigate('/')} />

            {isLoggedIn ? (
                //If the user is logged in, show the user information and logout link.
                <>
                    <div className="user-info">
                        <FaUser className="user-icon" />
                        <div className="user-name">{userName}</div>
                    </div>
                    <Link to="/logout">Logout</Link>
                </>
            ) : (
                //If the user is not logged in, show the Login and Signup buttons.
                <>
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/signup')}>Signup</button>
                </>
            )}
        </div>
    );
}

//Export the Navbar component so it can be used in other parts of the application.
export default Navbar;