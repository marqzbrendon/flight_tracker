import requests

params = {
    'access_key': '631d2eb152c49ea5c2808d97db9dc10d',
    'arr_iata': 'lax',
    'flight_status': 'active'
}

api_result = requests.get('http://api.aviationstack.com/v1/flights', params)

api_response = api_result.json()

flying_aircrafts = []

for flight in api_response['data']:
    if (flight['live'] is not None):
        if (flight['live']['is_ground'] is False):
            flying_aircrafts.append(flight)

print(flying_aircrafts)