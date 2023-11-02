from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
import re
from datetime import datetime
from flask_login import UserMixin
from sqlalchemy import func

db = SQLAlchemy()

# Association table for the many-to-many relationship between User and Restaurant
visits = db.Table('visits',
                  db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
                  db.Column('restaurant_id', db.Integer, db.ForeignKey('restaurant.id'))
                  )

class User(db.Model, SerializerMixin, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    # One-to-many relationships with Review
    reviews = db.relationship('Review', backref='user', lazy=True)

    # Many-to-many relationships with Restaurant
    restaurants = db.relationship('Restaurant', secondary=visits, back_populates='users')

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise AssertionError('Provided email is not valid.')
        return email

    @validates('password')
    def validate_password(self, key, password):
        if not re.search(r"[A-Z]", password):
            raise AssertionError('Password must contain at least one uppercase letter.')
        if not re.search(r"[a-z]", password):
            raise AssertionError('Password must contain at least one lowercase letter.')
        if not re.search(r"[0-9]", password):
            raise AssertionError('Password must contain at least one digit.')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise AssertionError('Password must contain at least one special character.')
        return password

class Restaurant(db.Model, SerializerMixin):
    __tablename__ = 'restaurant'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(300), nullable=True)
    
    # One-to-many relationships with Review
    reviews = db.relationship('Review', backref='restaurant', lazy=True)
    
    # Many-to-many relationships with User
    users = db.relationship('User', secondary=visits, back_populates='restaurants')

class Review(db.Model, SerializerMixin):
    __tablename__ = 'review'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, nullable=False, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)

    @validates('rating')
    def validate_rating(self, key, rating):
        if not 0 <= rating <= 5:
            raise AssertionError('Rating must be between 0 and 5.')
        return rating

    @validates('content')
    def validate_content(self, key, content):
        if len(content) < 10:
            raise AssertionError('Content must have at least 10 characters.')
        return content