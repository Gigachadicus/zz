// import React, { useState, useRef, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import { AnimationMixer, Vector3 } from 'three';
// import * as mpPose from '@mediapipe/pose'; // Import MediaPipe Pose
// import './App.css';

// const Model = ({ url, position, visible, setModelCoordinates }) => {
//   const { scene, animations } = useGLTF(url);
//   const mixer = useRef();

//   useEffect(() => {
//     if (animations && animations.length) {
//       mixer.current = new AnimationMixer(scene);
//       animations.forEach((clip) => {
//         mixer.current.clipAction(clip).play();
//       });
//     }

//     const extractBoneJointCoordinates = () => {
//       const coordinates = [];
//       scene.traverse((child) => {
//         if (child.isBone) {
//           const worldPosition = new Vector3();
//           child.updateMatrixWorld(true); // Ensure matrices are up to date
//           worldPosition.setFromMatrixPosition(child.matrixWorld);
//           coordinates.push([worldPosition.x, worldPosition.y, worldPosition.z]);
//         }
//       });
//       setModelCoordinates(coordinates);
//       console.log('Extracted Bone Joint Coordinates:', coordinates); // Add logging
//     };

//     extractBoneJointCoordinates();

//     return () => {
//       mixer.current = null;
//     };
//   }, [animations, scene, setModelCoordinates, url]); // Adding url to the dependency array

//   useFrame((state, delta) => {
//     const speedFactor = 0.2;
//     mixer.current?.update(delta * speedFactor);
//   });

//   return <primitive object={scene} position={position} visible={visible} />;
// };

// const Ground = () => (
//   <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
//     <planeGeometry args={[200, 200]} />
//     <meshStandardMaterial color="gray" />
//   </mesh>
// );

// function App() {
//   const [selectedModel, setSelectedModel] = useState('trial-1.glb');
//   const [modelCoordinates, setModelCoordinates] = useState([]);
//   const [videoCoordinates, setVideoCoordinates] = useState([]);
//   const [similarity, setSimilarity] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const getWebcam = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = stream;
//       } catch (err) {
//         console.error("Error accessing the webcam:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getWebcam();
//   }, []);

//   useEffect(() => {
//     const pose = new mpPose.Pose({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//     });
//     pose.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: false,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });

//     pose.onResults((results) => {
//       if (results.poseLandmarks) {
//         const coordinates = results.poseLandmarks.map((landmark) => [
//           landmark.x,
//           landmark.y,
//           landmark.z,
//         ]);
//         setVideoCoordinates(coordinates);
//       }
//     });

//     const sendFrameToPose = async () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//       await pose.send({ image: canvas });
//     };

//     const intervalId = setInterval(() => {
//       sendFrameToPose();
//     }, 1000); // Send a frame every second

//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     const sendCoordinatesToServer = async () => {
//       try {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//         const imageData = canvas.toDataURL('image/jpeg');

//         // Send both the image and model coordinates to the backend
//         const response = await fetch('http://localhost:5000/api/coordinates', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ modelCoordinates, videoCoordinates }), // Sending both model and video coordinates
//         });
//         const data = await response.json();
//         console.log('Similarity Percentage:', data.similarity);
//         setSimilarity(data["similarity"]);
//         console.log("Received model coordinates:", data.filtered_model_coordinates);
//         console.log("Received video coordinates:", data.filtered_video_coordinates);
//       } catch (error) {
//         console.error('Error sending coordinates:', error);
//       }
//     };

//     const intervalId = setInterval(() => {
//       sendCoordinatesToServer();
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, [modelCoordinates, videoCoordinates]);

//   return (
//     <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//       {loading && (
//         <div className="loading-screen">
//           <div className="spinner"></div>
//           <h2>Loading...</h2>
//         </div>
//       )}

//       <div className="health-bar-container">
//         <h2>Health Bar</h2>
//         <div className="health-bar">
//           <div
//             className="health-fill"
//             style={{
//               width: `${similarity}%`,
//               backgroundColor: similarity > 70 ? 'green' : similarity > 40 ? 'yellow' : 'red',
//             }}
//           />
//         </div>
//         <p>{(similarity ?? 0).toFixed(2)}%</p>
//       </div>

//       <div className="container">
//         <div className="mediaPipe s">
//           <video ref={videoRef} autoPlay />
//           <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
//         </div>
//         <div className="modelViewer s">
//           <select onChange={(e) => setSelectedModel(e.target.value)} value={selectedModel}>
//             <option value="trial-1.glb">Model 1</option>
//             <option value="trial-2.glb">Model 2</option>
//           </select>
//           <Canvas style={{ height: '100vh' }} shadows>
//             <ambientLight intensity={0.5} />
//             <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
//             <pointLight position={[0, 5, 0]} intensity={50} />
//             <Model
//               url={`/models/${selectedModel}`}
//               position={[-2, 0, 0]}
//               visible={true}
//               setModelCoordinates={setModelCoordinates}
//             />
//             <Ground />
//             <OrbitControls />
//           </Canvas>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;



import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { AnimationMixer, Vector3 } from 'three';
import * as mpPose from '@mediapipe/pose'; // Import MediaPipe Pose
import './App.css';

const Model = ({ url, position, visible, setModelCoordinates }) => {
  const { scene, animations } = useGLTF(url);
  const mixer = useRef();

  useEffect(() => {
    if (animations && animations.length) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => {
        mixer.current.clipAction(clip).play();
      });
    }

    const extractBoneJointCoordinates = () => {
      const coordinates = [];
      scene.traverse((child) => {
        if (child.isBone) {
          const worldPosition = new Vector3();
          child.updateMatrixWorld(true);
          worldPosition.setFromMatrixPosition(child.matrixWorld);
          coordinates.push([worldPosition.x, worldPosition.y, worldPosition.z]);
        }
      });
      setModelCoordinates(coordinates);
    };

    extractBoneJointCoordinates();

    return () => {
      mixer.current = null;
    };
  }, [animations, scene, setModelCoordinates]);

  useFrame((state, delta) => {
    const speedFactor = 0.2;
    mixer.current?.update(delta * speedFactor);
  });

  return <primitive object={scene} position={position} visible={visible} />;
};

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[200, 200]} />
    <meshStandardMaterial color="gray" />
  </mesh>
);

function App() {
  const [selectedModel, setSelectedModel] = useState('trial-1.glb');
  const [modelCoordinates, setModelCoordinates] = useState([]);
  const [videoCoordinates, setVideoCoordinates] = useState([]);
  const [similarity, setSimilarity] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const getWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing the webcam:', err);
      } finally {
        setLoading(false);
      }
    };

    getWebcam();
  }, []);

  useEffect(() => {
    const pose = new mpPose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        const coordinates = results.poseLandmarks.map((landmark) => [
          landmark.x,
          landmark.y,
          landmark.z,
        ]);
        setVideoCoordinates(coordinates);
      }
    });

    const sendFrameToPose = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      await pose.send({ image: canvas });
    };

    const intervalId = setInterval(() => {
      sendFrameToPose();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const sendCoordinatesToServer = async () => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const response = await fetch('http://localhost:5000/api/coordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ modelCoordinates, videoCoordinates }),
        });
        const data = await response.json();
        setSimilarity(data.similarity);
      } catch (error) {
        console.error('Error sending coordinates:', error);
      }
    };

    const intervalId = setInterval(() => {
      sendCoordinatesToServer();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [modelCoordinates, videoCoordinates]);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <h2>Loading...</h2>
        </div>
      )}

      <div className="health-bar-container">
        <h2>Health Bar</h2>
        <div className="health-bar">
          <div
            className="health-fill"
            style={{
              width: `${similarity}%`,
              backgroundColor: similarity > 70 ? 'green' : similarity > 40 ? 'yellow' : 'red',
            }}
          />
        </div>
        <p>{similarity.toFixed(2)}%</p>
      </div>

      <div className="container">
        <div className="mediaPipe s">
          <video ref={videoRef} autoPlay />
          <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
        </div>
        <div className="modelViewer s">
          <select onChange={(e) => setSelectedModel(e.target.value)} value={selectedModel}>
            <option value="trial-1.glb">Model 1</option>
            <option value="trial-2.glb">Model 2</option>
          </select>
          <Canvas style={{ height: '100vh' }} shadows>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <Model
              url={`/models/${selectedModel}`}
              position={[-2, 0, 0]}
              visible={true}
              setModelCoordinates={setModelCoordinates}
            />
            <Ground />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default App;