from app import app, db
from models import User, Restaurant, Review
from werkzeug.security import generate_password_hash

def seed_data():
    # Create and commit the data to the database
    db.create_all()

    # Users
    hashed_password1 = generate_password_hash("Gichachi@123", method='pbkdf2:sha256')
    user1 = User(email="gichachi@gmail.com", password=hashed_password1)

    hashed_password2 = generate_password_hash("Kmurll$123", method='pbkdf2:sha256')
    user2 = User(email="kmurll@gmail.com", password=hashed_password2)

    # Restaurants
    restaurant1 = Restaurant(
        name="The Copper Ivy",
        location="Nairobi",
        description="All Day Dining, Bar and Restaurant, Coffee Shop, Take Away, Bakery.",
        image="https://kenya.hsmagazine.digital/wp-content/uploads/2019/11/The-Copper-Ivy-A-Plush-Restaurant-In-Nairobi-Opening-Soon.jpg"
    )
    restaurant2 = Restaurant(
        name="Forodhani Sea-Front Restaurant",
        location="Mombasa",
        description="Authentic Swahili Cuisine with beautiful sea views, surrounded by the Mombasa culture and history",
        image="https://fastly.4sqi.net/img/general/600x600/27328_it82ZFG6LVU4PaJcAdYBQOIpXgjXx9Cj_FqLXz5-zKE.jpg"
    )
    restaurant3 = Restaurant(
        name="Tribe Hotel",
        location="Nairobi",
        description="This luxury boutique hotel in Nairobi offers air-conditioned accommodations with a complimentary mini-bar and free WiFi.",
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDmItWARppMsm3Fdsd4_jJQ38tsRMvZpyM0xG4hmuRybGNc5xVPTvxtto467Ec1trxmX8&usqp=CAU"
    )
    restaurant4 = Restaurant(
        name="Mahali Mzuri",
        location="Masai Mara",
        description="Surrounded by savannah in the Olare Motorogi Conservancy, this polished all-inclusive lodge is 28 km from Mara North Airstrip and 48 km from wildlife at Maasai Mara National Reserve.",
        image="https://www.micato.com/wp-content/uploads/2018/09/mahali-mzuri-2-2.jpg"
    )
    restaurant5 = Restaurant(
        name="Nyama Mama Delta",
        location="Nairobi",
        description="It serves up traditional Kenyan dishes with a modern twist. The restaurant is decorated in colorful Kenyan fabrics and hand-painted murals, and has two outlets",
        image="https://itin-dev.sfo2.cdn.digitaloceanspaces.com/freeImage/tPv8lFk3SNmZ23yjsXfk1LrJmFkZGuyr"
    )
    restaurant6 = Restaurant(
        name="Elsa's Kopje Lodge",
        location="Meru",
        description="This eco-friendly boutique lodge sits on Mughwango Hill overlooking the Meru plains. The elegant rustic cottages offer spectacular views over Meru National Park, and the restaurant serves excellent international dishes with an Italian influence. Activities include river fishing and visits to the park’s rhino sanctuary.",
        image="https://www.theluxurysafaricompany.com/app/uploads/2019/09/els.jpg"
    )
    restaurant7 = Restaurant(
        name="Hemingways Nairobi",
        location="Nairobi",
        description="It is a colonial-style boutique hotel harking back to the days when its namesake writer explored east Africa. It's set in the leafy and secluded suburbs of Karen looking out over the Ngong Hills, with elegant grounds making for a luxurious stopover between dusty safaris. ",
        image="https://www.africanmeccasafaris.com/wp-content/uploads/hemingwaysnairobi1.jpg"
    )
    restaurant8 = Restaurant(
        name="Saruni Samburu Lodge",
        location="Samburu",
        description="Offering stunning views over the plains, the lodge is located on the top of a rocky outcrop in the Kalama Conservancy bordering Samburu National Reserve. The spacious open-fronted villas feature open-air showers. There are two infinity pools and a massage hut. The cuisine has an Italian influence.",
        image="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/80/6c/4b/saruni-samburu.jpg?w=700&h=-1&s=1"
    )
    restaurant9 = Restaurant(
        name="Craving Inn",
        location="Mombasa",
        description="A coffee shop based at Citymall Nyali on the 2ND floor. Come enjoy a variety of snacks and meals. From burgers, sandwich, fish, chicken, samosa, kabab, vegetable options, cakes, waffles, coffees, mojitos, freak shakes, our chocolate loaded minipancakes.",
        image="https://uzamart.com/wp-content/uploads/2022/04/Screenshot_20220416-103715_Instagram.jpg"
    )
    restaurant10 = Restaurant(
        name="Boho Eatery",
        location="Nairobi",
        description="Boho Eatery is a vegan restaurant that was built with sustainable living in mind. The menu features dishes made with plant-based proteins and vegetables, making it a great choice for anyone looking for something healthy and delicious. The restaurant is located in a leafy suburb outside of the city, and the patio is one of the best places to enjoy your meal.",
        image="https://itin-dev.sfo2.cdn.digitaloceanspaces.com/freeImage/ScvVVtjRdE0gQKVn2hpoftlJhcplsw5B"
    )

    # Reviews
    review1 = Review(content="This place is great! Both the food and services are top notch", rating=5, user=user1, restaurant=restaurant1)
    review2 = Review(content="Not too bad. The view is great and also you get to experience the Swahili culture well but I waited for some time before my food came.", rating=3, user=user2, restaurant=restaurant2)
    
    # Populate many-to-many relationships (visits)
    user1.restaurants.append(restaurant1)
    user2.restaurants.append(restaurant2)

    db.session.add(user1)
    db.session.add(user2)
    db.session.add(restaurant1)
    db.session.add(restaurant2)
    db.session.add(restaurant3)
    db.session.add(restaurant4)
    db.session.add(restaurant5)
    db.session.add(restaurant6)
    db.session.add(restaurant7)
    db.session.add(restaurant8)
    db.session.add(restaurant9)
    db.session.add(restaurant10)
    db.session.add(review1)
    db.session.add(review2)

    db.session.commit()
    print("Data seeded!")

if __name__ == "__main__":
    with app.app_context():
        seed_data()