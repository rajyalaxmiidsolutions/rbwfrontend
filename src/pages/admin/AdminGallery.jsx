import { useState, useEffect } from 'react';
import { adminUploadGalleryPhoto, adminDeleteGalleryPhoto, getGalleryPhotos } from '../../services/api';
import { HiOutlineUpload, HiOutlineTrash, HiOutlinePhotograph, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data } = await getGalleryPhotos();
      setPhotos(data);
    } catch (err) {
      toast.error('Failed to load gallery photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('images', imageFile); // API expects field name 'images'
    formData.append('title', title);
    formData.append('description', description);

    setUploading(true);
    try {
      await adminUploadGalleryPhoto(formData);
      toast.success('Photo uploaded to gallery successfully');
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      fetchPhotos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this photo from the gallery?');
    if (!confirm) return;

    try {
      await adminDeleteGalleryPhoto(id);
      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-1 h-fit">
          <h2 className="text-base font-semibold text-text mb-4">Upload New Photo</h2>
          
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Image Selector / Dropzone */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Photo Image</label>
              <div className="relative border-2 border-dashed border-border hover:border-burgundy rounded-xl p-4 transition-colors flex flex-col items-center justify-center min-h-[160px] bg-bg/20">
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full py-4 text-gray-400 hover:text-burgundy transition-colors">
                    <HiOutlineUpload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium text-center">Click to browse or upload file</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Card Pressing Machine"
                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Standard offset printing press for wholesale wedding cards..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full px-4 py-2.5 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <HiOutlineUpload className="w-4.5 h-4.5" />
                  Upload Photo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Gallery Preview & Photo Grid */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-text">Uploaded Photos</h2>
            <span className="text-xs text-gray-400">{photos.length} total photos</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-video w-full rounded-xl bg-bg animate-pulse"></div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl max-w-sm mx-auto">
              <HiOutlinePhotograph className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-text mb-0.5">No Gallery Photos</h3>
              <p className="text-xs text-gray-400">Add photos using the form on the left to display them here and on the customer gallery page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {photos.map((photo) => (
                <div key={photo._id} className="group relative bg-bg border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  {/* Photo Container */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img src={photo.image.url} alt={photo.title} className="w-full h-full object-cover" />
                    {/* Hover eye action */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={photo.image.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/35 rounded-full text-white transition-colors">
                        <HiOutlineEye className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-text line-clamp-1">{photo.title || 'Untitled Photo'}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{photo.description || 'No description provided.'}</p>
                    </div>
                    
                    {/* Action Bar */}
                    <div className="flex justify-end border-t border-border mt-3 pt-3">
                      <button
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
