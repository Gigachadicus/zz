// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json({ limit: '50mb' }));

// function normalizeCoordinates(coordinates) {
//   if (!coordinates.length) return coordinates;

//   const xCoords = coordinates.map(coord => coord[0]);
//   const yCoords = coordinates.map(coord => coord[1]);
//   const zCoords = coordinates.map(coord => (coord.length > 2 ? coord[2] : 0));

//   const minX = Math.min(...xCoords);
//   const maxX = Math.max(...xCoords);
//   const minY = Math.min(...yCoords);
//   const maxY = Math.max(...yCoords);
//   const minZ = Math.min(...zCoords);
//   const maxZ = Math.max(...zCoords);

//   return coordinates.map(([x, y, z = 0]) => [
//     (x - minX) / (maxX - minX) || 0.5,
//     (y - minY) / (maxY - minY) || 0.5,
//     (z - minZ) / (maxZ - minZ) || 0.5
//   ]);
// }

// function calculateSimilarity(humanCoords, modelCoords) {
//   const filteredHumanCoords = humanCoords.filter((_, i) => ![1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 27, 28].includes(i));
//   const filteredModelCoords = modelCoords.filter((_, i) => ![0, 1, 2, 4, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 60, 62, 63].includes(i));

//   const lenHuman = filteredHumanCoords.length;
//   const lenModel = filteredModelCoords.length;

//   while (filteredHumanCoords.length < lenModel) filteredHumanCoords.push(null);
//   while (filteredModelCoords.length < lenHuman) filteredModelCoords.push(null);

//   let totalDistance = 0;
//   let validPairs = 0;
//   const correspondences = [
//     [0, 16], [1, 19], [2, 17], [3, 13], [4, 15], [5, 5], [6, 9], [7, 4],
//     [8, 14], [9, 10], [10, 8], [11, 1], [12, 6], [13, 0], [14, 7], [15, 2],
//     [16, 3], [17, 12], [18, 18], [19, 11]
//   ];

//   for (let i = 0; i < correspondences.length; i++) {
//     const [x, y] = correspondences[i];
//     if (filteredHumanCoords[x] && filteredModelCoords[y]) {
//       const distance = Math.sqrt(
//         Math.pow(filteredHumanCoords[x][0] - filteredModelCoords[y][0], 2) +
//         Math.pow(filteredHumanCoords[x][1] - filteredModelCoords[y][1], 2) +
//         Math.pow(filteredHumanCoords[x][2] - filteredModelCoords[y][2], 2)
//       );
//       totalDistance += distance;
//       validPairs++;
//     }
//   }

//   if (validPairs === 0) return 0;

//   const avgDistance = totalDistance / validPairs;

//   const maxDistance = Math.sqrt(3); // Maximum possible distance in a normalized coordinate space
//   const normalizedDistance = avgDistance / maxDistance;

//   const similarityPercentage = (1 - normalizedDistance) * 100;
//   return similarityPercentage;
// }


// app.post('/api/coordinates', async (req, res) => {
//   const {modelCoordinates, videoCoordinates } = req.body;
//   if (!modelCoordinates || !videoCoordinates) {
//     return res.status(400).json({ error: 'Missing data in request' });
//   }

//   try {
//     const normalizedVideoCoords = normalizeCoordinates(videoCoordinates);
//     const normalizedModelCoords = normalizeCoordinates(modelCoordinates);

//     const similarityPercentage = calculateSimilarity(normalizedVideoCoords, normalizedModelCoords);
//     console.log(normalizedVideoCoords);
//     res.json({
//       filtered_model_coordinates: normalizedModelCoords,
//       filtered_video_coordinates: normalizedVideoCoords,
//       similarity: similarityPercentage
//     });
//   } catch (error) {
//     console.error('Error processing coordinates:', error);
//     res.status(500).json({ error: 'Failed to process coordinates' });
//   }
// });

// app.listen(5000, () => {
//   console.log('Server running on http://localhost:5000');
// });


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

function normalizeCoordinates(coordinates) {
  if (!coordinates.length) return coordinates;

  const xCoords = coordinates.map(coord => coord[0]);
  const yCoords = coordinates.map(coord => coord[1]);
  const zCoords = coordinates.map(coord => (coord.length > 2 ? coord[2] : 0));

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  const minZ = Math.min(...zCoords);
  const maxZ = Math.max(...zCoords);

  return coordinates.map(([x, y, z = 0]) => [
    (x - minX) / (maxX - minX) || 0.5,
    (y - minY) / (maxY - minY) || 0.5,
    (z - minZ) / (maxZ - minZ) || 0.5
  ]);
}

function calculateSimilarity(humanCoords, modelCoords) {
  const filteredHumanCoords = humanCoords.filter((_, i) => ![1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 27, 28].includes(i));
  const filteredModelCoords = modelCoords.filter((_, i) => ![0, 1, 2, 4, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 60, 62, 63].includes(i));

  const lenHuman = filteredHumanCoords.length;
  const lenModel = filteredModelCoords.length;

  while (filteredHumanCoords.length < lenModel) filteredHumanCoords.push(null);
  while (filteredModelCoords.length < lenHuman) filteredModelCoords.push(null);

  let totalDistance = 0;
  let validPairs = 0;
  const correspondences = [
    [0, 16], [1, 19], [2, 17], [3, 13], [4, 15], [5, 5], [6, 9], [7, 4],
    [8, 14], [9, 10], [10, 8], [11, 1], [12, 6], [13, 0], [14, 7], [15, 2],
    [16, 3], [17, 12], [18, 18], [19, 11]
  ];

  for (let i = 0; i < correspondences.length; i++) {
    const [x, y] = correspondences[i];
    if (filteredHumanCoords[x] && filteredModelCoords[y]) {
      const distance = Math.sqrt(
        Math.pow(filteredHumanCoords[x][0] - filteredModelCoords[y][0], 2) +
        Math.pow(filteredHumanCoords[x][1] - filteredModelCoords[y][1], 2) +
        Math.pow(filteredHumanCoords[x][2] - filteredModelCoords[y][2], 2)
      );
      totalDistance += distance;
      validPairs++;
    }
  }

  if (validPairs === 0) return 0;

  const avgDistance = totalDistance / validPairs;

  const maxDistance = Math.sqrt(3); // Maximum possible distance in a normalized coordinate space
  const normalizedDistance = avgDistance / maxDistance;

  const similarityPercentage = (1 - normalizedDistance) * 100;
  return similarityPercentage;
}


app.post('/api/coordinates', async (req, res) => {
  const { modelCoordinates, videoCoordinates } = req.body;
  if (!modelCoordinates || !videoCoordinates) {
    return res.status(400).json({ error: 'Missing data in request' });
  }

  try {
    const normalizedModel = normalizeCoordinates(modelCoordinates);
    const normalizedVideo = normalizeCoordinates(videoCoordinates);

    const similarity = calculateSimilarity(normalizedVideo, normalizedModel);
    console.log(similarity);
    res.json({
      similarity,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process coordinates' });
  }
});


app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});