'use client';

import { useState, useTransition } from 'react';
import {
  Camera,
  Upload,
  Heart,
  Star,
  Download,
  Trash2,
  Filter,
  Grid,
  LayoutGrid,
  Check,
  X,
  QrCode,
  Share2,
  Eye,
  ImagePlus,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  category: string;
  uploaded_by: 'host' | 'photographer' | 'guest';
  uploader_name?: string;
  is_featured: boolean;
  is_approved: boolean;
  likes_count: number;
  created_at: string;
}

interface PhotoStats {
  total: number;
  approved: number;
  pending: number;
  byCategory: Record<string, number>;
  byUploader: Record<string, number>;
}

interface Props {
  eventId: string;
  eventName: string;
  photos: Photo[];
  pendingPhotos: Photo[];
  stats: PhotoStats;
  onUpload: (data: { url: string; caption?: string; category: string; is_featured?: boolean }) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onToggleFeatured: (photoId: string) => Promise<void>;
  onApprove: (photoId: string) => Promise<void>;
  onReject: (photoId: string) => Promise<void>;
  onLike: (photoId: string) => Promise<void>;
  uploadQRUrl: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Photos', icon: Grid },
  { value: 'pre_wedding', label: 'Pre-Wedding', icon: Camera },
  { value: 'mehendi', label: 'Mehendi', icon: Sparkles },
  { value: 'haldi', label: 'Haldi', icon: Sparkles },
  { value: 'sangeet', label: 'Sangeet', icon: Sparkles },
  { value: 'wedding', label: 'Wedding', icon: Heart },
  { value: 'reception', label: 'Reception', icon: Sparkles },
  { value: 'candid', label: 'Candid', icon: Camera },
  { value: 'couple', label: 'Couple', icon: Heart },
  { value: 'family', label: 'Family', icon: Heart },
  { value: 'guests', label: 'Guests', icon: Heart },
  { value: 'decor', label: 'Decor', icon: Sparkles },
  { value: 'food', label: 'Food', icon: Sparkles },
];

export function PhotoGallery({
  eventId,
  eventName,
  photos,
  pendingPhotos,
  stats,
  onUpload,
  onDelete,
  onToggleFeatured,
  onApprove,
  onReject,
  onLike,
  uploadQRUrl,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Upload form state
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('candid');
  const [uploadFeatured, setUploadFeatured] = useState(false);

  const filteredPhotos = photos.filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  );

  const featuredPhotos = photos.filter(p => p.is_featured);

  const handleUpload = async () => {
    if (!uploadUrl) return;

    startTransition(async () => {
      await onUpload({
        url: uploadUrl,
        caption: uploadCaption,
        category: uploadCategory,
        is_featured: uploadFeatured,
      });
      setShowUploadModal(false);
      setUploadUrl('');
      setUploadCaption('');
      setUploadCategory('candid');
      setUploadFeatured(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Photo Gallery</h2>
            <p className="text-white/80">{eventName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <QrCode className="h-4 w-4" />
              Guest Upload QR
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-white/80">Total Photos</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-3xl font-bold">{featuredPhotos.length}</p>
            <p className="text-sm text-white/80">Featured</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-3xl font-bold">{stats.byUploader?.guest || 0}</p>
            <p className="text-sm text-white/80">Guest Uploads</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center relative">
            <p className="text-3xl font-bold">{stats.pending}</p>
            <p className="text-sm text-white/80">Pending Review</p>
            {stats.pending > 0 && (
              <button
                onClick={() => setShowModerationPanel(true)}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Photos Carousel */}
      {featuredPhotos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            Featured Moments
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featuredPhotos.map(photo => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt={photo.caption || 'Featured photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const count = cat.value === 'all' ? photos.length : (stats.byCategory?.[cat.value] || 0);
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.value
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
              {count > 0 && (
                <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredPhotos.length} photos
        </p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'masonry' ? "bg-white shadow-sm" : "hover:bg-gray-200"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
          <p className="text-gray-500 mt-1 mb-4">Upload your first photos to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photos
          </button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid'
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        )}>
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              className={cn(
                "relative rounded-xl overflow-hidden group cursor-pointer bg-gray-100",
                viewMode === 'grid' ? "aspect-square" : "aspect-auto"
              )}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() => onLike(photo.id));
                        }}
                        className="flex items-center gap-1 text-white text-sm"
                      >
                        <Heart className="h-4 w-4" />
                        {photo.likes_count}
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() => onToggleFeatured(photo.id));
                        }}
                        className={cn(
                          "p-1.5 rounded-full",
                          photo.is_featured
                            ? "bg-amber-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        )}
                      >
                        <Star className={cn("h-3 w-3", photo.is_featured && "fill-current")} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTransition(() => onDelete(photo.id));
                        }}
                        className="p-1.5 bg-white/20 text-white rounded-full hover:bg-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Badge */}
              {photo.is_featured && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400 drop-shadow-lg" />
                </div>
              )}

              {/* Uploader Badge */}
              {photo.uploaded_by === 'guest' && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Guest
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Photos</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo URL *
                </label>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload to a service like Cloudinary or Imgur first
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Describe this moment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={uploadFeatured}
                  onChange={(e) => setUploadFeatured(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-700">Mark as featured</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadUrl || isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Guest Photo Upload</h3>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code or share the link to let guests upload their photos
            </p>

            <div className="bg-gray-100 p-6 rounded-xl mb-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                {/* Placeholder for QR code - in real app, use a QR library */}
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 mb-4">
              <input
                type="text"
                readOnly
                value={uploadQRUrl}
                className="flex-1 bg-transparent text-sm text-center"
              />
              <button
                onClick={() => navigator.clipboard.writeText(uploadQRUrl)}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Photo'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4">{selectedPhoto.caption}</p>
            )}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Moderation Panel */}
      {showModerationPanel && pendingPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review Guest Photos</h3>
              <button
                onClick={() => setShowModerationPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pendingPhotos.map(photo => (
                  <div key={photo.id} className="relative rounded-lg overflow-hidden">
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt="Pending photo"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                      <button
                        onClick={() => startTransition(() => onApprove(photo.id))}
                        className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => startTransition(() => onReject(photo.id))}
                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {photo.uploader_name && (
                      <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded px-2 py-1 text-xs truncate">
                        By: {photo.uploader_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
