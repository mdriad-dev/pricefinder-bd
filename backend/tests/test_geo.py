from app.services.geo import calculate_haversine_distance, build_google_maps_url


def test_calculate_haversine_distance():
    # Dhanmondi 27 (23.7538, 90.3752) to Gulshan 2 (23.7937, 90.4137) in Dhaka
    dist = calculate_haversine_distance(23.7538, 90.3752, 23.7937, 90.4137)
    # Distance in Dhaka between these two landmarks is ~5.9 - 6.0 km
    assert 5.5 <= dist <= 6.5


def test_calculate_haversine_distance_same_point():
    dist = calculate_haversine_distance(23.7538, 90.3752, 23.7538, 90.3752)
    assert dist == 0.0


def test_build_google_maps_url():
    url = build_google_maps_url(23.7538, 90.3752)
    assert url == "https://www.google.com/maps/dir/?api=1&destination=23.753800,90.375200"
