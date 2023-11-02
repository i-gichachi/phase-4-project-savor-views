from flask import Flask, request, jsonify, session, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from werkzeug.exceptions import NotFound
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf import FlaskForm
from flask_wtf.csrf import CSRFProtect, generate_csrf
from wtforms import StringField, PasswordField, FloatField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, NumberRange
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

from models import db, User, Restaurant, Review 

app = Flask(__name__)
app.config['SECRET_KEY'] = "fac593f8a353d654d97be5af17016a7fcb23120426328907"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

csrf = CSRFProtect(app)
CORS(app, supports_credentials=True) 
api = Api(app)
db.init_app(app)
migrate = Migrate(app, db)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.before_request
def before_request():
    csrf.protect()

class UserForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])

class ReviewForm(FlaskForm):
    content = TextAreaField('Content', validators=[DataRequired(), Length(min=10)])
    rating = FloatField('Rating', validators=[DataRequired(), NumberRange(min=0, max=5)])

class CSRFTokenResource(Resource):
    def get(self):
        csrf_token = generate_csrf()
        return jsonify({'token': csrf_token})

api.add_resource(CSRFTokenResource, '/csrf_token')

# Signup resource
class Signup(Resource):
    def post(self):
        form = UserForm()
        if form.validate_on_submit():
            hashed_password = generate_password_hash(form.password.data, method='pbkdf2:sha256')
            user = User(email=form.email.data, password=hashed_password)
            db.session.add(user)
            db.session.commit()
            return make_response(jsonify({"message": "User created successfully!"}), 201)
        return {"message": "Invalid input!", "errors": form.errors}, 400

api.add_resource(Signup, '/signup')

class Auth(Resource):

    def post(self):
        form = UserForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()
            if user and check_password_hash(user.password, form.password.data):
                login_user(user)
                return {"message": "Logged in successfully!"}, 200
            return {"message": "Invalid credentials!"}, 401
        return {"message": "Invalid input!", "errors": form.errors}, 400

    @login_required
    def get(self):
        return {
            "id": current_user.id,
            "email": current_user.email
        }, 200

api.add_resource(Auth, '/auth')

class Logout(Resource):
    @login_required
    def post(self):  # Changed from get to post
        logout_user()
        return make_response(jsonify({"message": "Logged out successfully!"}))

api.add_resource(Logout, '/logout')

# Restaurants resource
class RestaurantsList(Resource):
    def get(self):
        restaurants = Restaurant.query.all()
        restaurant_list = []
        for restaurant in restaurants:
            restaurant_dict = {
                "id": restaurant.id,
                "name": restaurant.name,
                "location": restaurant.location,
                "image": restaurant.image
            }
            restaurant_list.append(restaurant_dict)
        return make_response(jsonify(restaurant_list), 200)

api.add_resource(RestaurantsList, '/restaurants')

class RestaurantDetail(Resource):
    def get(self, restaurant_id):
        restaurant = Restaurant.query.get_or_404(restaurant_id)
        
        # Assuming reviews have a 'rating' field and there's a relationship between restaurants and reviews
        reviews = restaurant.reviews
        avg_rating = sum([review.rating for review in reviews]) / len(reviews) if reviews else 0

        restaurant_detail = {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "description": restaurant.description,
            "image": restaurant.image,
            "average_rating": avg_rating
        }
        return make_response(jsonify(restaurant_detail), 200)

api.add_resource(RestaurantDetail, '/restaurants/<int:restaurant_id>')

class RestaurantReviews(Resource):
    def get(self, restaurant_id):
        # Fetch reviews with associated user email for a particular restaurant from the database
        reviews_with_email = (db.session.query(Review, User.email)
                              .join(User, Review.user_id == User.id)
                              .filter(Review.restaurant_id == restaurant_id)
                              .all())
        
        # Initialize an empty list to hold the review dictionaries
        review_list = []

        # Loop through each review and its associated email
        for review, email in reviews_with_email:
            # Create a dictionary representation of the review, including the user's email
            review_dict = {
                "id": review.id,
                "content": review.content,
                "rating": review.rating,
                "user_id": review.user_id,
                "restaurant_id": review.restaurant_id,
                "user_email": email
            }

            # Append the review dictionary to the review list
            review_list.append(review_dict)

        # After the loop has processed all the reviews, return the entire list
        return make_response(jsonify(review_list), 200)

    @login_required
    def post(self, restaurant_id):
        """
        Posts a review for a specific restaurant. 
        Only authenticated users can post reviews.
        """
        form = ReviewForm()

        # Create a new review object linked to the authenticated user
        if form.validate_on_submit():
            new_review = Review(
                content=form.content.data,
                rating=form.rating.data,
                user_id=current_user.id,
                restaurant_id=restaurant_id
                )
            
            # Save the review to the database
            db.session.add(new_review)
            db.session.commit()
            
            # Prepare the response data
            response_data = {
                "id": new_review.id,
                "content": new_review.content,
                "rating": new_review.rating,
                "timestamp": new_review.timestamp.isoformat(),  
                "user_id": new_review.user_id,
                "restaurant_id": new_review.restaurant_id
                }
            
            # Return the response
            return make_response(jsonify(response_data), 201)
        
        # If form validation fails, return error message
        return {"message": "Invalid input!", "errors": form.errors}, 400  # Corrected the status code here

api.add_resource(RestaurantReviews, '/restaurants/<int:restaurant_id>/reviews')

class SingleReview(Resource):
    def get(self, restaurant_id, review_id):
        review, email = db.session.query(Review, User.email).join(User, Review.user_id == User.id).filter(Review.restaurant_id == restaurant_id, Review.id == review_id).first_or_404()
        review_data = {
            "id": review.id,
            "content": review.content,
            "rating": review.rating,
            "user_id": review.user_id,
            "restaurant_id": review.restaurant_id,
            "user_email": email,
            "timestamp": review.timestamp.isoformat(), 
            "updated_at": review.updated_at.isoformat()  
            }
        
        return make_response(jsonify(review_data), 200)

    @login_required
    def put(self, restaurant_id, review_id):
        """
        Updates a specific review for a restaurant.
        Only the author of the review can update it.
        """
        
        form = ReviewForm()
        review = Review.query.filter_by(restaurant_id=restaurant_id, id=review_id).first()
        
        if not review:
            return {"message": "Review not found!"}, 404

        # Ensure the logged-in user is the author of the review
        if current_user.id != review.user_id:
            return {"message": "Unauthorized! You can only update your own reviews."}, 403
        
        if form.validate_on_submit():
            review.content = form.content.data
            review.rating = form.rating.data
            db.session.commit()
            updated_data = {
                "id": review.id,
                "content": review.content,
                "rating": review.rating,
                "user_id": review.user_id,
                "restaurant_id": review.restaurant_id,
                "updated_at": review.updated_at.isoformat()  
                }
            return make_response(jsonify(updated_data), 200)

    @login_required
    def delete(self, restaurant_id, review_id):
        """
        Deletes a specific review for a restaurant.
        Only the author of the review can delete it.
        """
        
        review = Review.query.filter_by(restaurant_id=restaurant_id, id=review_id).first()

        if not review:
            return {"message": "Review not found!"}, 404

        # Ensure the logged-in user is the author of the review
        if current_user.id != review.user_id:
            return {"message": "Unauthorized! You can only delete your own reviews."}, 403
        
        db.session.delete(review)
        db.session.commit()
        return make_response(jsonify({"message": "Review deleted!"}), 200)

api.add_resource(SingleReview, '/restaurants/<int:restaurant_id>/reviews/<int:review_id>')

if __name__ == "__main__":
    app.run(port=5555, debug=True)