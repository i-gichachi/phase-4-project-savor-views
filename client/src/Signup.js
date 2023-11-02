import React, { useState, useEffect } from 'react';
//useFormik for form handling and validation
import { useFormik } from 'formik';
//Yup for defining validation schema for the form
import * as Yup from 'yup';
//useNavigate hook from 'react-router-dom' to programmatically navigate
import { useNavigate } from 'react-router-dom';
//Importing CSS styles for the component
import './Signup.css'

//Define the validation schema for the Signup form using Yup
const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email') 
        .required('Required')
        .test('at-symbol', 'Email must contain "@"', value => value.includes('@')), //Custom test to ensure email contains '@'
    password: Yup.string()
        .required('Required')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one digit')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: Yup.string()
        .required('Required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'), //Ensure that confirmPassword matches the password
    terms: Yup.bool()
        .required('You must agree with the terms and conditions')
        .oneOf([true], 'You must agree with the terms and conditions') //Ensure the terms checkbox is checked
});

function Signup() {
    //State to store the CSRF token for secure requests
    const [csrfToken, setCsrfToken] = useState('');
    //Hook to programmatically navigate to other routes
    const navigate = useNavigate();

    //Use effect hook to fetch CSRF token once the component mounts
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/csrf_token', {
                    credentials: 'include'
                });
                const data = await response.json();
                setCsrfToken(data.token);
            } catch (error) {
                console.error("Error fetching CSRF token:", error);
            }
        };

        fetchCsrfToken();
    }, []);

    //Using useFormik to manage form state, handle changes, validations, and submission
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
            terms: false
        },
        validationSchema: SignupSchema,
        onSubmit: async (values) => {
            const { email, password } = values;
            
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                if (response.ok) {
                    alert("Signup successful!");
                    navigate('/login'); //Redirect to login page on successful signup
                } else {
                    const data = await response.json();
                    alert("Signup error: " + data.message);
                }
            } catch (error) {
                alert("An error occurred: " + error);
            }
        }
    });

    return (
        <div className="signup-page">
            <h2>Signup</h2>
            <form onSubmit={formik.handleSubmit}>
                {/* Input fields for email, password, confirmPassword and terms */}
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? <div className="error">{formik.errors.email}</div> : null}
                </div>
                
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? <div className="error">{formik.errors.password}</div> : null}
                </div>
                
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input 
                        type="password" 
                        name="confirmPassword"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? <div className="error">{formik.errors.confirmPassword}</div> : null}
                </div>
                
                <div className="form-group">
                    <input 
                        type="checkbox" 
                        name="terms"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        checked={formik.values.terms}
                    />
                    <label>I agree with terms and conditions</label>
                    {formik.touched.terms && formik.errors.terms ? <div className="error">{formik.errors.terms}</div> : null}
                </div>

                <div className="form-group">
                    <input type="submit" value="Signup" />
                </div>
            </form>
        </div>
    );
}

export default Signup;