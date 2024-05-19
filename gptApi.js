import OpenAI from 'openai';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./firebase.js";

require('dotenv').config();

const googleMapsApiKey = 'AIzaSyDbzPrpnA5bpx93D9r8ZJTkE3SieROXCMg';

const openai = new OpenAI({
	apiKey: 'sk-proj-wB4q1e7sDPtdEVNZnC3gT3BlbkFJ9I54pdRvCgiAMuwqGurx', // This is the default and can be omitted
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
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
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
	const response = await axios.get(
		'https://maps.googleapis.com/maps/api/geocode/json',
		{
			params: {
				address: location,
				key: googleMapsApiKey,
			},
		}
	);

	const { results } = response.data;
	const city = results[0].address_components.find((component) =>
		component.types.includes('locality')
	).long_name;
	const country = results[0].address_components.find((component) =>
		component.types.includes('country')
	).long_name;

	if (results.length === 0) {
		throw new Error('Location not found');
	}

	const { lat, lng } = results[0].geometry.location;
	return { lat, lng, city, country };
}

async function getElevation(lat, lng) {
	const response = await axios.get(
		'https://maps.googleapis.com/maps/api/elevation/json',
		{
			params: {
				locations: `${lat},${lng}`,
				key: googleMapsApiKey,
			},
		}
	);

	const elevationResults = response.data.results;

	if (elevationResults.length === 0) {
		throw new Error('Elevation data not found');
	}

	return elevationResults[0].elevation;
}

async function getNearbyPlaces(lat, lng) {
	const response = await axios.post(
		'https://places.googleapis.com/v1/places:searchNearby',
		{
			includedTypes: [
				'restaurant',
				'cafe',
				'bar',
				'lodging',
				'tourist_attraction',
			],
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

	return response.data.places;
}

async function getPlaceDetails(places, lat, lng) {
	const placeDetails = await Promise.all(
		places.map(async (place) => {
			const geocodeResponse = await axios.get(
				'https://maps.googleapis.com/maps/api/geocode/json',
				{
					params: {
						address: place.displayName.text,
						key: googleMapsApiKey,
					},
				}
			);

			const { results } = geocodeResponse.data;

			if (results.length === 0) {
				return null;
			}

			const placeLat = results[0].geometry.location.lat;
			const placeLng = results[0].geometry.location.lng;
			const { deltaX, deltaY } = calculateVector(
				lat,
				lng,
				placeLat,
				placeLng
			);

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
      size: '256x256', // Size of the generated image
    });

    const imageUrl = response.data[0].url;

    // Fetch the image as a blob
    const imageResponse = await fetch(imageUrl);
    const blob = await imageResponse.blob();

    // Generate a unique file name
    const storageRef = ref(storage, `uploads/${uuidv4()}`);
    
    // Upload the blob to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('File uploaded successfully');

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);

    const data = {
        title: image_description,
        accountId: "mohammadanwar.testnet",
        media: downloadURL,

    }

    axios.post('http://localhost:4000/mintNft', data)
        .then((response) => {
        console.log('Response:', response.data);
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    
    return downloadURL;

  } catch (error) {
    console.error('Error generating image:', error);
    return null; // Returning null to indicate failure
  }
}



export {
	gptCompletion,
	generateImage,
	toRadians,
	haversineDistance,
	calculateVector,
	getGeocode,
	getElevation,
	getNearbyPlaces,
	getPlaceDetails,
};
