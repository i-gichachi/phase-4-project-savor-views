import React, { useState, useEffect } from 'react';  //Imports React and the hooks: useState and useEffect.
import { useFormik } from 'formik';  //Imports useFormik hook from 'formik' library.
import * as Yup from 'yup';  //Imports all exports from 'yup' library for validation.
import { useNavigate } from 'react-router-dom';  //Imports the useNavigate hook for programmatic navigation.
import './Login.css'  //Imports styles for this component.

//Defines the validation schema for the login form using Yup.
const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')  //Validates if the input is a valid email.
        .required('Required')  //Input is required.
        .test('at-symbol', 'Email must contain "@"', value => value.includes('@')),  //Additional test to ensure email contains '@'.
    password: Yup.string()
        .required('Required')  //Password is required.
        //The following validations are to ensure the password meets certain criteria:
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one digit')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
});

function Login({ onLoginSuccess }) {  //The Login component receives a prop: onLoginSuccess function.
    const navigate = useNavigate();  //Hook to programmatically navigate.
    const [csrfToken, setCsrfToken] = useState(null);  //Initializes the state for CSRF token.

    //Fetches the CSRF token on component mount.
    useEffect(() => {
        async function fetchCsrfToken() {
            try {
                const response = await fetch('/csrf_token');  //Fetch CSRF token from the backend.
                const data = await response.json();  //Convert response to JSON.
                setCsrfToken(data.token);  //Set the CSRF token in the state.
            } catch (error) {
                alert("Error fetching CSRF token: " + error);  //Handle errors.
            }
        }
        fetchCsrfToken();  //Call the function to initiate the fetch.
    }, []);  //Empty dependency array means useEffect runs once on component mount.

    //Initialize the form with Formik.
    const formik = useFormik({
        initialValues: {  //Initial values for form fields.
            email: '',
            password: ''
        },
        validationSchema: LoginSchema,  //Assigning our defined validation schema.
        onSubmit: async (values) => {  //Function that runs on form submission.
            if (!csrfToken) {
                alert("CSRF token is missing. Please refresh and try again.");
                return;
            }

            try {
                //Post the form data to the '/auth' endpoint for authentication.
                const response = await fetch('/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(values),
                    credentials: 'include'
                });

                //Check the content type of the response.
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();  //Convert response to JSON.

                    if (response.ok) {
                        //After a successful login, fetch the user's info.
                        const userResponse = await fetch('/auth', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken
                            },
                            credentials: 'include'
                        });

                        if (userResponse.ok) {
                            const userData = await userResponse.json();  //Convert response to JSON.
                            //Store user details in session storage.
                            sessionStorage.setItem('userId', userData.id);
                            sessionStorage.setItem('userEmail', userData.email);
                            onLoginSuccess(userData.email);  //Invoke the passed down function to update the parent state.
                            alert("Login successful!");
                            navigate('/');  //Navigate to home.
                        } else {
                            alert("Error fetching user details.");
                        }
                    } else {
                        alert("Login error: " + data.message);
                    }
                } else {
                    alert("An error occurred: Server did not return a JSON response.");
                }
            } catch (error) {
                alert("An error occurred: " + error);
            }
        }
    });

    return (
        <div className="login-page">
            <h2>Login</h2>
            {/* Form for login */}
            <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email"
                        onChange={formik.handleChange}  //Handle changes in input.
                        onBlur={formik.handleBlur}  //Handle blur events.
                        value={formik.values.email}  //Bind input value to formik state.
                    />
                    {/* Show validation error messages */}
                    {formik.touched.email && formik.errors.email ? <div className="error">{formik.errors.email}</div> : null}
                </div>
                
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password"
                        onChange={formik.handleChange}  //Handle changes in input.
                        onBlur={formik.handleBlur}  //Handle blur events.
                        value={formik.values.password}  //Bind input value to formik state.
                    />
                    {/* Show validation error messages */}
                    {formik.touched.password && formik.errors.password ? <div className="error">{formik.errors.password}</div> : null}
                </div>

                <div className="form-group">
                    <input type="submit" value="Login" />
                </div>
            </form>
        </div>
    );
}

export default Login;  //Exports the Login component for use in other parts of the application.