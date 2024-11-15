import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognitionAndRegistration: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [mode, setMode] = useState<'recognition' | 'registration'>('recognition');
  const [recognizedUser, setRecognizedUser] = useState<{ name: string; position: string; photo: string } | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(error => console.error("Ошибка доступа к камере:", error));
  };

  const captureDescriptor = async () => {
    if (videoRef.current && modelsLoaded) {
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setDescriptor(detection.descriptor);
        console.log("Считывание данных лица:", detection.descriptor);
      } else {
        console.error("Лицо не определено.");
      }
    }
  };

  const handleRegister = async () => {
    if (!name || !position || !photoUrl || !descriptor) {
      alert("Пожалуйста заполните поля и считайте данные с лица.");
      return;
    }

    const response = await fetch('http://localhost:5000/users/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        position,
        photo: photoUrl,
        faceDescriptor: Array.from(descriptor),
      }),
    });

    if (response.ok) {
      alert("Пользователь успешно зарегистрирован!");
      setName('');
      setPosition('');
      setPhotoUrl('');
      setDescriptor(null);
    } else {
      alert("Ошибка регистрации пользователя");
    }
  };

  const handleRecognizeFace = async () => {
    if (videoRef.current && modelsLoaded) {
      setIsRecognizing(true);
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        const descriptor = detections[0].descriptor;
        try {
          const response = await fetch('http://localhost:5000/users/compare-face', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descriptor: Array.from(descriptor) }),
          });

          if (response.ok) {
            const user = await response.json();
            if (user) {
              setRecognizedUser(user);
            } else {
              setRecognizedUser(null);
              console.log("Пользователь не найден");
            }
          } else {
            console.error("Ошибка получения данных о пользователе!");
          }
        } catch (error) {
          console.error("Ошибка распознования лица:", error);
        }
      } else {
        console.log("Лицо не определено!");
      }
      setIsRecognizing(false);
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  return (
    <div>
      <h1>Sellwin Face Mode</h1>
      <div>
        <button onClick={() => setMode('recognition')}>Распознавание</button>
        <button onClick={() => setMode('registration')}>Регистрация</button>
      </div>
      {mode === 'registration' && (
        <div>
          <input
            type="text"
            placeholder="Фамилия и имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Должность"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <input
            type="text"
            placeholder="Фото"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <button onClick={captureDescriptor}>Захват лица пользователя</button>
          <button onClick={handleRegister} disabled={!descriptor}>
            Register User
          </button>
        </div>
      )}
      {mode === 'recognition' && (
        <div>
          <button onClick={handleRecognizeFace}>Определение лица</button>
          {recognizedUser && (
            <div>
              <h2>Сотрудник:</h2>
              <p>Фамилия и имя: {recognizedUser.name}</p>
              <p>Должность: {recognizedUser.position}</p>
              <img src={recognizedUser.photo} alt="Фото пользователя" width="100" />
            </div>
          )}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        width="640"
        height="480"
        onPlay={mode === 'recognition' ? handleRecognizeFace : undefined}
      />
      {!modelsLoaded && <p>Загрузка модели...</p>}
      {isRecognizing && <p>Определение лица ...</p>}
    </div>
  );
};

export default FaceRecognitionAndRegistration;
