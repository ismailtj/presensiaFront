import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
// import QRCode from 'qrcode.react';

const QrPage = () => {
  const { id } = useParams();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">QR Code de la séance</h1>
        <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={id}
            viewBox={`0 0 256 256`}
        />
        <p className="mt-4 text-gray-600">ID séance : {id}</p>
      </div>
    </div>
  );
};

export default QrPage;