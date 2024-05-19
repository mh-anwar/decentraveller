import OpenAI from 'openai';
import axios from 'axios';
const googleMapsApiKey = "AIzaSyDbzPrpnA5bpx93D9r8ZJTkE3SieROXCMg";


const openai = new OpenAI({
	apiKey: "sk-proj-kNbNYM4MokximEdduPp1T3BlbkFJSAe0JVwIuCRfjZfG7viH", // This is the default and can be omitted
});

async function gptCompletion(messages) {
	const chatCompletion = await openai.chat.completions.create({
		messages: messages,
		model: 'gpt-4o',
	});
	return chatCompletion.choices[0];
}

// Function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to calculate the distance between two latitude/longitude coordinates using the Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
}

// Function to calculate the displacement vector between two latitude/longitude coordinates
function calculateVector(lat1, lon1, lat2, lon2) {
    let deltaX = haversineDistance(lat1, lon1, lat1, lon2); // Displacement in longitude
    let deltaY = haversineDistance(lat1, lon1, lat2, lon1); // Displacement in latitude

    // Correct the sign of the displacements based on the direction
    if (lon2 < lon1) deltaX = -deltaX;
    if (lat2 < lat1) deltaY = -deltaY;

	deltaX /= 1000;
	deltaY /= 1000;

    return { deltaX, deltaY };
}

// Function to calculate the vector between two latitude/longitude coordinates
// function calculateVector(lat1, lon1, lat2, lon2) {
//     const distance = haversineDistance(lat1, lon1, lat2, lon2);
//     const deltaX = toRadians(lon2 - lon1) * Math.cos(toRadians((lat1 + lat2) / 2));
//     const deltaY = toRadians(lat2 - lat1);
//     return { deltaX, deltaY };
// }

async function getGeocode(location) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
            address: location,
            key: googleMapsApiKey,
        },
    });

    const { results } = response.data;
    console.log("Geocode API: ", JSON.stringify(response.data, null, 2));
    const city = results[0].address_components.find(component => component.types.includes("locality")).long_name;
    const country = results[0].address_components.find(component => component.types.includes("country")).long_name;

    if (results.length === 0) {
        throw new Error('Location not found');
    }

    const { lat, lng } = results[0].geometry.location;
    return { lat, lng, city, country };
}

async function getElevation(lat, lng) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/elevation/json', {
        params: {
            locations: `${lat},${lng}`,
            key: googleMapsApiKey,
        },
    });

    const elevationResults = response.data.results;
    console.log("Elevation API: ", JSON.stringify(response.data, null, 2));

    if (elevationResults.length === 0) {
        throw new Error('Elevation data not found');
    }

    return elevationResults[0].elevation;
}

async function getNearbyPlaces(lat, lng) {
    const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
            includedTypes: ["restaurant", "cafe", "bar", "lodging", "tourist_attraction"],
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: { latitude: lat, longitude: lng },
                    radius: 500.0,
                },
            },
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': googleMapsApiKey,
                'X-Goog-FieldMask': 'places.displayName',
            },
        }
    );

    console.log("Nearby Places API: ", JSON.stringify(response.data, null, 2));
    return response.data.places;
}

async function getPlaceDetails(places, lat, lng) {
    const placeDetails = await Promise.all(
        places.map(async (place) => {
            const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: place.displayName.text,
                    key: googleMapsApiKey,
                },
            });

            const { results } = geocodeResponse.data;
			console.log(results)

            if (results.length === 0) {
                return null;
            }

            const placeLat = results[0].geometry.location.lat;
            const placeLng = results[0].geometry.location.lng;
            const { deltaX, deltaY } = calculateVector(lat, lng, placeLat, placeLng);

            return {
                displacementX: deltaX,
                displacementY: deltaY,
            };
        })
    );

    return placeDetails.filter(Boolean);
}

async function generateImage(image_description) {
    try {
      const response = await openai.images.generate({
        prompt: image_description,
        n: 1, // Number of images to generate
        size: '1024x1024', // Size of the generated image
      });
  
      const imageUrl = response.data[0].url;
      console.log(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      return null; // Returning null to indicate failure
    }
  }
  

export { gptCompletion, generateImage, toRadians, haversineDistance, calculateVector, getGeocode, getElevation, getNearbyPlaces, getPlaceDetails };