import { useState, useEffect } from 'react';
import {
  adminUploadGalleryPhoto,
  adminDeleteGalleryPhoto,
  getGalleryPhotos,
  adminGetAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement
} from '../../services/api';
import {
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineVolumeUp
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminGallery = () => {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'announcements'

  // --- GALLERY STATE ---
  const [photos, setPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- ANNOUNCEMENTS STATE ---
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    message: '',
    displayPages: [],
    startDate: '',
    endDate: ''
  });

  const availablePages = ['Home', 'Shop', 'Cart', 'Contact'];

  // --- FETCHING DATA ---
  const fetchPhotos = async () => {
    setGalleryLoading(true);
    try {
      const { data } = await getGalleryPhotos();
      setPhotos(data);
    } catch (err) {
      toast.error('Failed to load gallery photos');
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const { data } = await adminGetAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchPhotos();
    } else {
      fetchAnnouncements();
    }
  }, [activeTab]);

  // --- GALLERY HANDLERS ---
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
    formData.append('images', imageFile);
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

  // --- ANNOUNCEMENT HANDLERS ---
  const openCreateAnnouncement = () => {
    setEditId(null);
    setAnnouncementForm({
      message: '',
      displayPages: [],
      startDate: '',
      endDate: ''
    });
    setShowModal(true);
  };

  const openEditAnnouncement = (ann) => {
    setEditId(ann._id);
    const formattedStartDate = ann.startDate ? new Date(ann.startDate).toISOString().split('T')[0] : '';
    const formattedEndDate = ann.endDate ? new Date(ann.endDate).toISOString().split('T')[0] : '';
    setAnnouncementForm({
      message: ann.message || '',
      displayPages: ann.displayPages || [],
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    setShowModal(true);
  };

  const handlePageCheckboxChange = (page) => {
    setAnnouncementForm((prev) => {
      const alreadySelected = prev.displayPages.includes(page);
      const updatedPages = alreadySelected
        ? prev.displayPages.filter((p) => p !== page)
        : [...prev.displayPages, page];
      return { ...prev, displayPages: updatedPages };
    });
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementForm.message.trim()) {
      toast.error('Message is required');
      return;
    }
    if (!announcementForm.startDate) {
      toast.error('Start Date is required');
      return;
    }
    if (!announcementForm.endDate) {
      toast.error('End Date is required');
      return;
    }
    if (new Date(announcementForm.startDate) > new Date(announcementForm.endDate)) {
      toast.error('Start Date cannot be after End Date');
      return;
    }

    setSavingAnnouncement(true);
    try {
      const payload = {
        message: announcementForm.message.trim(),
        displayPages: announcementForm.displayPages,
        startDate: announcementForm.startDate,
        endDate: announcementForm.endDate
      };

      if (editId) {
        await adminUpdateAnnouncement(editId, payload);
        toast.success('Announcement updated successfully');
      } else {
        await adminCreateAnnouncement(payload);
        toast.success('Announcement created successfully');
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminDeleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'gallery'
                ? 'bg-white text-burgundy shadow-sm'
                : 'text-gray-500 hover:text-text'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-white text-burgundy shadow-sm'
                : 'text-gray-500 hover:text-text'
            }`}
          >
            Announcements
          </button>
        </div>

        {activeTab === 'announcements' && (
          <button
            onClick={openCreateAnnouncement}
            className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Announcement
          </button>
        )}
      </div>

      {/* --- GALLERY TAB CONTENT --- */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form Card */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-1 h-fit">
            <h2 className="text-base font-semibold text-text mb-4">Upload New Photo</h2>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Image Selector */}
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

            {galleryLoading ? (
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
      )}

      {/* --- ANNOUNCEMENTS TAB CONTENT --- */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {announcementsLoading ? (
              <div className="p-8 text-center text-gray-500">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                <HiOutlineVolumeUp className="w-12 h-12 text-gray-300 mb-2" />
                <h3 className="text-sm font-medium text-text mb-0.5">No Announcements</h3>
                <p className="text-xs text-gray-400">Add announcements to display them as page banners and on the notice board.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Announcement</th>
                    <th className="px-6 py-4">Target Pages</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-text">
                  {announcements.map((ann) => {
                    const startDate = ann.startDate ? new Date(ann.startDate).toLocaleDateString() : '';
                    const endDate = ann.endDate ? new Date(ann.endDate).toLocaleDateString() : '';
                    const now = new Date();
                    const isValid = new Date(ann.startDate) <= now && now <= new Date(ann.endDate);

                    return (
                      <tr key={ann._id} className="hover:bg-bg/40 transition-colors">
                        <td className="px-6 py-4 max-w-md">
                          <p className="font-medium text-gray-800 break-words">{ann.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {ann.displayPages && ann.displayPages.length > 0 ? (
                              ann.displayPages.map((page) => (
                                <span key={page} className="px-2 py-0.5 bg-burgundy/10 text-burgundy text-xs font-medium rounded-full">
                                  {page}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">None selected</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs text-gray-600 gap-0.5">
                            <span>From: {startDate}</span>
                            <span>To: {endDate}</span>
                            <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                              isValid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isValid ? 'Valid / Active Now' : 'Out of date range'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => openEditAnnouncement(ann)}
                              className="p-1.5 text-gray-500 hover:text-burgundy hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            >
                              <HiOutlinePencil className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann._id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              <HiOutlineTrash className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl border border-border">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-bg rounded-full transition-colors"
            >
              <HiOutlineX className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-text mb-5">
              {editId ? 'Edit Announcement' : 'Add Announcement'}
            </h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Announcement Message *</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Enter announcement text..."
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none"
                />
              </div>

              {/* Display Pages */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Display Pages</label>
                <div className="grid grid-cols-2 gap-3.5 bg-bg p-3.5 rounded-xl border border-border">
                  {availablePages.map((page) => (
                    <label key={page} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={announcementForm.displayPages.includes(page)}
                        onChange={() => handlePageCheckboxChange(page)}
                        className="accent-burgundy w-4.5 h-4.5 rounded"
                      />
                      <span className="text-sm font-medium text-text">{page}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={announcementForm.startDate}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, startDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={announcementForm.endDate}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, endDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="w-full bg-burgundy hover:bg-burgundy/95 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2 text-sm"
              >
                {savingAnnouncement ? 'Saving...' : editId ? 'Update Announcement' : 'Create Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
