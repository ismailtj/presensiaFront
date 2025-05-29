import axios from 'axios';
import QrScanner from 'qr-scanner';
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router';
const apiUrl = import.meta.env.VITE_API_URL;


const EtudiantPage = () => {

  
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async  result => {
          try {
            const seanceId = result.data; // ID string du QR → int
            const eleveId = localStorage.getItem('id'); // id stocké localement
            if (!seanceId || !eleveId) {
              alert('ID élève ou ID séance invalide.');
              return;
            }
            scannerRef.current?.stop(); // stop scan après 1 lecture
            const token = localStorage.getItem('jwt');
            
            const payload = {
              data: {
                pointage: new Date().toISOString(),
                seance: seanceId,
                eleve: eleveId
              }
            }
            

            const response = await axios.post(apiUrl+'/api/emargements', payload , {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            

            alert('Présence enregistrée avec succès !');
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            navigate('/login');

          } catch (error) {
            console.error('Erreur API :', error);
            alert('Erreur lors du pointage. Réessayez.');
          }
          
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true
        }
      );

      scanner.start();
      scannerRef.current = scanner;

      return () => {
        scanner.stop();
      };
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold text-green-600 text-center mb-4">Bienvenue Étudiant</h1>
      <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold mb-2">Scanner un QR Code</h2>
        <video ref={videoRef} className="w-full max-w-md border rounded shadow" />
      </div>
    </div>
  </div>
  )
}

export default EtudiantPage