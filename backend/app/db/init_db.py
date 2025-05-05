import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone, timedelta

from app.db.database import Base, engine, async_session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.item import Item, ItemType, CategoryEnum


async def init_db():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a test user if no users exist
    async with async_session() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        
        test_user = None
        if user_count == 0:
            print("Creating test user...")
            test_user = User(
                name="Test User",
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
            )
            session.add(test_user)
            await session.commit()
            await session.refresh(test_user)
            print("Test user created!")
        else:
            # Get the first user to associate items with
            result = await session.execute(text("SELECT id FROM users LIMIT 1"))
            user_id = result.scalar()
            if user_id:
                print(f"Using existing user with ID: {user_id} for sample items")
                test_user = await session.get(User, user_id)
            
        # Check if there are any items
        result = await session.execute(text("SELECT COUNT(*) FROM items"))
        item_count = result.scalar()
        
        if item_count == 0 and test_user:
            print("Creating sample items...")
            
            # Bangalore locations
            locations = [
                {"name": "Majestic", "lat": 12.977439, "lng": 77.570839},
                {"name": "Koramangala", "lat": 12.934533, "lng": 77.626579},
                {"name": "Indiranagar", "lat": 12.971891, "lng": 77.641151},
                {"name": "Jayanagar", "lat": 12.925007, "lng": 77.593803},
                {"name": "Basavanagudi", "lat": 12.9436, "lng": 77.5732},
                {"name": "MG Road", "lat": 12.9756, "lng": 77.6050},
                {"name": "Ulsoor", "lat": 12.9843, "lng": 77.6190},
                {"name": "Richmond Town", "lat": 12.9611, "lng": 77.6000},
                {"name": "Shivajinagar", "lat": 12.9918, "lng": 77.6055},
                {"name": "Domlur", "lat": 12.9583, "lng": 77.6384},
                {"name": "Avalahalli", "lat": 13.0333, "lng": 77.75},
                {"name": "Chikkabanahalli", "lat": 13.0238, "lng": 77.7474},
                {"name": "Dod Banhalli", "lat": 13.05, "lng": 77.77},
                {"name": "Kondaspur", "lat": 13.02, "lng": 77.74},
                {"name": "Chik-Banhalli", "lat": 13.06, "lng": 77.78},
                {"name": "Chimsandra", "lat": 13.07, "lng": 77.79}
            ]
            
            now = datetime.now(timezone.utc)
            
            # Sample items
            sample_items = [
                # EVENTS - Community Meetup
                Item(
                    type=ItemType.EVENT,
                    title="Neighborhood Community Meetup",
                    description="Join us for a neighborhood community meetup at the local park. Meet your neighbors and discuss local issues.",
                    category=CategoryEnum.COMMUNITY_MEETUP,
                    start_date=now + timedelta(days=14),
                    end_date=now + timedelta(days=14, hours=2),
                    address=f"{locations[0]['name']}, Bangalore",
                    latitude=locations[0]['lat'],
                    longitude=locations[0]['lng'],
                    image="/static/uploads/community_meetup.jpg",
                    user_id=test_user.id,
                ),
                # EVENTS - Workshop
                Item(
                    type=ItemType.EVENT,
                    title="Tech Workshop",
                    description="Hands-on workshop on web development. Learn to build your first website!",
                    category=CategoryEnum.WORKSHOP,
                    start_date=now + timedelta(days=7),
                    end_date=now + timedelta(days=7, hours=4),
                    address=f"{locations[1]['name']}, Bangalore",
                    latitude=locations[1]['lat'],
                    longitude=locations[1]['lng'],
                    image="/static/uploads/tech_workshop.jpg",
                    user_id=test_user.id,
                ),
                # EVENTS - Food
                Item(
                    type=ItemType.EVENT,
                    title="Food Festival",
                    description="Sample cuisines from around the world at our annual food festival.",
                    category=CategoryEnum.FOOD,
                    start_date=now + timedelta(days=3),
                    end_date=now + timedelta(days=3, hours=8),
                    address=f"{locations[2]['name']}, Bangalore",
                    latitude=locations[2]['lat'],
                    longitude=locations[2]['lng'],
                    image="/static/uploads/food_festival.jpg",
                    user_id=test_user.id,
                ),
                # EVENTS - Sale
                Item(
                    type=ItemType.EVENT,
                    title="Weekend Market Sale",
                    description="Local vendors selling handmade goods, vintage items, and more at discounted prices.",
                    category=CategoryEnum.SALE,
                    start_date=now + timedelta(days=5),
                    end_date=now + timedelta(days=5, hours=6),
                    address=f"{locations[3]['name']}, Bangalore",
                    latitude=locations[3]['lat'],
                    longitude=locations[3]['lng'],
                    image="/static/uploads/market_sale.jpg",
                    user_id=test_user.id,
                ),
                # EVENTS - Music
                Item(
                    type=ItemType.EVENT,
                    title="Live Music Concert",
                    description="Local bands performing live. Food and drinks available for purchase.",
                    category=CategoryEnum.MUSIC,
                    start_date=now + timedelta(days=2, hours=19),
                    end_date=now + timedelta(days=2, hours=23),
                    address=f"{locations[4]['name']}, Bangalore",
                    latitude=locations[4]['lat'],
                    longitude=locations[4]['lng'],
                    image="/static/uploads/music_concert.jpg",
                    user_id=test_user.id,
                ),
                                Item(
                    type=ItemType.EVENT,
                    title="East Bangalore Farmers' Market",
                    description="Local farmers bring fresh produce and handmade goods to Avalahalli every weekend.",
                    category=CategoryEnum.SALE,
                    start_date=now + timedelta(days=10),
                    end_date=now + timedelta(days=10, hours=5),
                    address=f"{locations[10]['name']}, Bangalore",
                    latitude=locations[10]['lat'],
                    longitude=locations[10]['lng'],
                    image="/static/uploads/farmers_market.jpg",
                    user_id=test_user.id,
                ),
                
                # DEALS - Food
                Item(
                    type=ItemType.DEAL,
                    title="Half-off at Local Cafe",
                    description="Get 50% off all drinks at the neighborhood cafe this weekend.",
                    category=CategoryEnum.FOOD,
                    start_date=now,
                    end_date=now + timedelta(days=3),
                    address=f"{locations[5]['name']}, Bangalore",
                    latitude=locations[5]['lat'],
                    longitude=locations[5]['lng'],
                    image="/static/uploads/cafe_deal.jpg",
                    user_id=test_user.id,
                ),
                # DEALS - Sale
                Item(
                    type=ItemType.DEAL,
                    title="Buy One Get One Free Books",
                    description="Buy any book and get another of equal or lesser value for free.",
                    category=CategoryEnum.SALE,
                    start_date=now,
                    end_date=now + timedelta(days=14),
                    address=f"{locations[6]['name']}, Bangalore",
                    latitude=locations[6]['lat'],
                    longitude=locations[6]['lng'],
                    image="/static/uploads/book_deal.jpg",
                    user_id=test_user.id,
                ),
                # DEALS - Workshop
                Item(
                    type=ItemType.DEAL,
                    title="Discounted Yoga Workshop",
                    description="Join our yoga workshop series at 30% off the regular price.",
                    category=CategoryEnum.WORKSHOP,
                    start_date=now,
                    end_date=now + timedelta(days=30),
                    address=f"{locations[7]['name']}, Bangalore",
                    latitude=locations[7]['lat'],
                    longitude=locations[7]['lng'],
                    image="/static/uploads/yoga_workshop.jpg",
                    user_id=test_user.id,
                ),
                # DEALS - Community Meetup
                Item(
                    type=ItemType.DEAL,
                    title="Community Center Discount",
                    description="Book our community center for your next event at a special rate.",
                    category=CategoryEnum.COMMUNITY_MEETUP,
                    start_date=now + timedelta(days=10),
                    end_date=now + timedelta(days=40),
                    address=f"{locations[8]['name']}, Bangalore",
                    latitude=locations[8]['lat'],
                    longitude=locations[8]['lng'],
                    image="/static/uploads/community_meetup.jpg",
                    user_id=test_user.id,
                ),
                # DEALS - Music
                Item(
                    type=ItemType.DEAL,
                    title="Music Store Sale",
                    description="20% off all instruments and accessories at our local music store.",
                    category=CategoryEnum.MUSIC,
                    start_date=now,
                    end_date=now + timedelta(days=7),
                    address=f"{locations[9]['name']}, Bangalore",
                    latitude=locations[9]['lat'],
                    longitude=locations[9]['lng'],
                    image="/static/uploads/music_concert.jpg",
                    user_id=test_user.id,
                ),
                Item(
                    type=ItemType.DEAL,
                    title="50% Off Street Eats",
                    description="Get half-price on popular street food stalls in Chikkabanahalli this month.",
                    category=CategoryEnum.FOOD,
                    start_date=now,
                    end_date=now + timedelta(days=30),
                    address=f"{locations[11]['name']}, Bangalore",
                    latitude=locations[11]['lat'],
                    longitude=locations[11]['lng'],
                    image="/static/uploads/street_eats.jpg",
                    user_id=test_user.id,
                ),
            ]
            
            for item in sample_items:
                session.add(item)
            
            await session.commit()
            print(f"Database initialized with {len(sample_items)} sample items!")
        elif item_count > 0:
            print("Database already contains items, skipping item initialization.")
        else:
            print("Could not create sample items: No user available.")


if __name__ == "__main__":
    asyncio.run(init_db())
