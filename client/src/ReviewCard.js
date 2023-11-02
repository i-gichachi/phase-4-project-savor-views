import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRatingComponent from 'react-star-rating-component';
import './ReviewCard.css';

function ReviewCard() {
    // useParams hook to extract the restaurant ID from the URL
    const { id: restaurantId } = useParams();

    // State variables to manage different pieces of data
    const [reviews, setReviews] = useState([]); // State to store the list of reviews
    const [currentUserId, setCurrentUserId] = useState(null); // State to store the ID of the current user
    const [reviewBeingEdited, setReviewBeingEdited] = useState(null); // State to store the review being edited
    const [rating, setRating] = useState(0); // State to store the rating of the review being edited
    const [content, setContent] = useState(''); // State to store the content of the review being edited
    const [csrfToken, setCsrfToken] = useState(null); // State to store the CSRF token for security

    // Array containing descriptions for each star rating
    const starDescriptions = ["Very Bad", "Bad", "Average", "Good", "Excellent"];

    // useEffect hook to fetch the CSRF token when the component mounts
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

    // useEffect hook to fetch reviews and the current user's information when the component mounts or the restaurant ID changes
    useEffect(() => {
        async function fetchReviews() {
            const response = await fetch(`/restaurants/${restaurantId}/reviews`);
            if (response.ok) {
                const reviewsData = await response.json();
                if (Array.isArray(reviewsData)) {
                    setReviews(reviewsData);
                } else {
                    console.error('Expected an array of reviews but received:', reviewsData);
                }
            } else {
                console.error('Failed to fetch reviews');
            }
        }

        async function fetchCurrentUser() {
            try {
                const userResponse = await fetch('/auth', { credentials: 'include' });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setCurrentUserId(userData.id);
                }
            } catch (err) {
                console.error('Failed to fetch current user', err);
            }
        }

        fetchReviews();
        fetchCurrentUser();
    }, [restaurantId]);

    // Handler function for when the "Edit" button is clicked
    const handleEditClick = (review) => {
        setReviewBeingEdited(review);
        setRating(review.rating);
        setContent(review.content);
    };

    // Handler function for updating a review
    const handleUpdateReview = async (review) => {
        try {
            const response = await fetch(`/restaurants/${restaurantId}/reviews/${review.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    rating: rating
                })
            });

            if (response.ok) {
                const updatedReview = await response.json();
                handleReviewUpdated(updatedReview);
            } else {
                console.error('Failed to update the review');
            }
        } catch (error) {
            console.error('There was an error updating the review:', error);
        }
    };

    // Handler function for refreshing the UI after a review is updated
    const handleReviewUpdated = (updatedReview) => {
        setReviews(prevReviews => prevReviews.map(r => r.id === updatedReview.id ? updatedReview : r));
        setReviewBeingEdited(null);
    };

    // Handler function for deleting a review
    const handleDeleteClick = async (reviewId) => {
        try {
            const response = await fetch(`/restaurants/${restaurantId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include'
            });

            if (response.ok) {
                setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
            } else {
                console.error('Failed to delete the review');
            }
        } catch (error) {
            console.error('There was an error deleting the review:', error);
        }
    };

    //Render the component
    return (
        <div>
            {/* Map over each review and display its details */}
            {reviews.map(review => (
                <div key={review.id} className="review-card">
                    <div className="review-header">
                        <p className="review-email">{review.user_email ? review.user_email : 'Anonymous'}</p>
                        <StarRatingComponent 
                            name={`rate${review.id}`}
                            starCount={5}
                            value={review.rating}
                            editing={false}
                        />
                        <span className="star-description">{starDescriptions[Math.ceil(review.rating) - 1]}</span>
                    </div>
                    {reviewBeingEdited && reviewBeingEdited.id === review.id ? (
                        <div>
                            {/* Show edit form if the review is currently being edited */}
                            <textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Edit your review"
                            />
                            <StarRatingComponent 
                                name="rateEdit"
                                starCount={5}
                                value={rating}
                                onStarClick={(nextValue) => setRating(nextValue)}
                            />
                            <button onClick={() => handleUpdateReview(review)}>Update</button>
                            <button onClick={() => setReviewBeingEdited(null)}>Cancel</button>
                        </div>                   
                    ) : (
                        <>
                            {/* Otherwise, just show the review content */}
                            <p className="review-content">{review.content}</p>
                            {/* Show edit and delete buttons if the review belongs to the current user */}
                            {currentUserId === review.user_id && (
                                <div className="review-actions">
                                    <button onClick={() => handleEditClick(review)} disabled={!csrfToken}>Edit</button>
                                    <button onClick={() => handleDeleteClick(review.id)} disabled={!csrfToken}>Delete</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
            {/* Loading indicator while fetching CSRF token */}
            {!csrfToken && <p>Loading...</p>}
        </div>
    );
}

export default ReviewCard;