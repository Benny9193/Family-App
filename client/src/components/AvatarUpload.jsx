import { useState, useRef } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import { uploadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AvatarUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const response = await uploadService.uploadAvatar(file);
      if (onUploadSuccess) {
        onUploadSuccess(response.avatarUrl);
      }
      setPreview(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload avatar');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = preview || (user?.avatarUrl ? `${window.location.origin}${user.avatarUrl}` : null);

  return (
    <div className="relative inline-block">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold text-2xl cursor-pointer overflow-hidden"
        style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user?.fullName?.charAt(0).toUpperCase()
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow-lg"
        disabled={uploading}
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiCamera className="text-sm" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
