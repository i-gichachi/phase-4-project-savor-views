import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import StarRatingComponent from 'react-star-rating-component';
import { useParams } from 'react-router-dom';
import './ReviewForm.css'

// Define the validation schema using Yup for form validation
const validationSchema = Yup.object({
    content: Yup.string().min(10, 'Must be 10 characters or more').required('Required'),
    rating: Yup.number().min(1).max(5).required('Required'),
});

function ReviewForm({ onReviewAdded }) {
    // Extract restaurantId from the URL using useParams
    const { restaurantId } = useParams();

    // State hooks for managing star rating description and CSRF token
    const [starDescription, setStarDescription] = useState("");
    const [csrfToken, setCsrfToken] = useState("");

    // Static mapping of rating values to their descriptions
    const ratingDescriptions = {
        1: 'Awful',
        2: 'Bad',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
    };

    // useEffect hook to fetch CSRF token when the component mounts
    useEffect(() => {
        async function fetchCsrfToken() {
            try {
                const response = await fetch('/csrf_token');
                const data = await response.json();
                setCsrfToken(data.token);
            } catch (error) {
                console.error('There was an error fetching the CSRF token:', error);
            }
        }

        fetchCsrfToken();
    }, []);

    // Initialize useFormik hook to handle form operations
    const formik = useFormik({
        initialValues: {
            content: '',
            rating: 0,
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!restaurantId) {
                console.error("Restaurant ID is undefined.");
                return;
            }

            try {
                const response = await fetch(`/restaurants/${restaurantId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(values),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    // Check if onReviewAdded is a function before invoking
                    if (typeof onReviewAdded === 'function') {
                        onReviewAdded(data);
                    }
                    // Display a success message to the user using window.alert
                    window.alert('Review added successfully!');
                } else {
                    console.error('Error adding review:', data.message);
                }
            } catch (error) {
                console.error('There was an error submitting the review:', error);
            }
        }
    });

    return (
        // Render the form
        <form onSubmit={formik.handleSubmit}>
            <textarea 
                name="content" 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.content}
            ></textarea>
            <StarRatingComponent 
                name="rating"
                starCount={5}
                value={formik.values.rating}
                onStarClick={(nextValue) => {
                    formik.setFieldValue('rating', nextValue);
                    setStarDescription(ratingDescriptions[nextValue]);
                }}
            />
            <p>{starDescription}</p>
            <button type="submit">Submit Review</button>
        </form>
    );
}

// Add a default prop for onReviewAdded to avoid potential errors
ReviewForm.defaultProps = {
    onReviewAdded: () => {}
};

export default ReviewForm;