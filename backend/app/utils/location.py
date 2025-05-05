import math
from typing import Tuple

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points on the Earth's surface using the Haversine formula.
    Returns distance in kilometers.
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences in coordinates
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance

def get_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculate a bounding box around a point given a radius in kilometers.
    Returns (min_lat, min_lon, max_lat, max_lon)
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    
    # Angular distance in radians on a great circle
    angular_distance = radius_km / R
    
    # Calculate min and max latitudes
    min_lat = lat_rad - angular_distance
    max_lat = lat_rad + angular_distance
    
    # Calculate min and max longitudes
    # This is an approximation that works well for small distances
    delta_lon = math.asin(math.sin(angular_distance) / math.cos(lat_rad))
    min_lon = lon_rad - delta_lon
    max_lon = lon_rad + delta_lon
    
    # Convert back to degrees
    min_lat = math.degrees(min_lat)
    min_lon = math.degrees(min_lon)
    max_lat = math.degrees(max_lat)
    max_lon = math.degrees(max_lon)
    
    return (min_lat, min_lon, max_lat, max_lon)
