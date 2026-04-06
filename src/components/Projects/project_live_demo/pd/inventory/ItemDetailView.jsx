"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
  Edit2,
  Image as ImageIcon,
  MapPin,
  Tag,
  Layers,
  Hash,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { items as itemsService } from "../../../utils/api/api-service.js";
import { getStoredToken } from "../../../utils/auth";

export function ItemDetailView({ item, onAddToCart, onBack, onEdit }) {
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotationTimer = useRef(null);

  // Image cache like HR Department
  const [imageCache, setImageCache] = useState(new Map());

  const deriveStatus = (item) => {
    const bal = Number(item.balance) || 0;
    const min = Number(item.min_stock) || 0;
    if (bal === 0) return "Out Of Stock";
    if (min > 0 && bal < min) return "Low In Stock";
    return "In Stock";
  };

  const status = deriveStatus(item);

  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "Out Of Stock":
        return {
          bg: "bg-red-50 dark:bg-red-500/10",
          text: "text-red-700 dark:text-red-400",
          icon: XCircle,
          label: "Out of Stock",
        };
      case "Low In Stock":
        return {
          bg: "bg-amber-50 dark:bg-amber-500/10",
          text: "text-amber-700 dark:text-amber-400",
          icon: AlertTriangle,
          label: "Low Stock",
        };
      default:
        return {
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          text: "text-emerald-700 dark:text-emerald-400",
          icon: CheckCircle2,
          label: "In Stock",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const incrementQuantity = () => {
    if (quantity < (item.balance || 0)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "-";
    return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Load images individually like HR Department for faster loading
  const loadImagesIndividually = async () => {
    if (!item?.item_no) return;

    try {
      // First try to get the image list
      const res = await itemsService.getItemImages(item.item_no);
      if (!res?.success) throw new Error("Failed to load images");

      const imageList = res.data || [];

      // Load each image individually
      imageList.forEach((img) => {
        (async () => {
          try {
            const imageUrl = itemsService.getItemImageUrl(
              item.item_no,
              img.filename,
            );

            // Test if the image exists by fetching it
            const response = await fetch(imageUrl, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${getStoredToken()}`,
              },
            });

            if (response.ok) {
              // Cache the URL
              setImageCache((prev) =>
                new Map(prev).set(img.filename, imageUrl),
              );
            }
          } catch (err) {
            console.log(
              `[ItemDetailView] ✗ Error loading image ${img.filename}:`,
              err.message,
            );
          }
        })();
      });

      // Set images list
      setImages(imageList);
      setCurrentIndex(0);
    } catch (e) {
      console.error("[ItemDetailView] Failed to load images list:", e);
      // Fallback to latest image
      try {
        const latestUrl = itemsService.getItemLatestImageUrl(item.item_no);
        const response = await fetch(latestUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getStoredToken()}`,
          },
        });

        if (response.ok) {
          setImageCache((prev) => new Map(prev).set("latest", latestUrl));
          setImages([{ filename: "latest", url: latestUrl }]);
        }
      } catch (fallbackErr) {
        console.log("[ItemDetailView] No images available");
      }
    }
  };

  useEffect(() => {
    setImageError(false);
    setImageCache(new Map()); // Clear cache for new item
    setImages([]);
    setImageUrl(null);

    if (item?.item_no) {
      loadImagesIndividually();
    }
  }, [item?.item_no]);

  // Auto-rotate when multiple images
  useEffect(() => {
    if (rotationTimer.current) {
      clearInterval(rotationTimer.current);
      rotationTimer.current = null;
    }
    if (images.length > 1) {
      rotationTimer.current = setInterval(() => {
        setCurrentIndex((idx) => (idx + 1) % images.length);
      }, 4000); // 4s rotation
    }
    return () => {
      if (rotationTimer.current) clearInterval(rotationTimer.current);
    };
  }, [images.length]);

  useEffect(() => {
    if (images.length > 0 && currentIndex < images.length) {
      const currentImage = images[currentIndex];
      if (currentImage) {
        const cachedUrl = imageCache.get(currentImage.filename);
        setImageUrl(cachedUrl || null);
        setImageError(false);
      }
    } else {
      setImageUrl(null);
    }
  }, [currentIndex, images, imageCache]);

  return (
    <div className="max-w-6xl mx-auto p-5 sm:p-8">
      {/* ─── Top Navigation Bar ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Directory</span>
        </button>

        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Record</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Column: Image Viewer ─────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl flex items-center justify-center p-6 border border-zinc-200 dark:border-zinc-800 shadow-inner relative overflow-hidden group">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={item.item_name}
                className="w-full h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-600">
                <ImageIcon
                  className="w-16 h-16 mb-3 opacity-50"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium tracking-wide uppercase">
                  No Image Available
                </span>
              </div>
            )}

            {/* Status Floating Badge */}
            <div className="absolute top-4 left-4">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${statusConfig.bg} ${statusConfig.text}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-zinc-900 dark:bg-white w-6"
                      : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Right Column: Details & Actions ───────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Header Details */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> {item.item_no}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white leading-tight mb-4">
              {item.item_name}
            </h1>
            <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80 mb-0.5">
                Unit Price
              </span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {formatCurrency(item.price_per_unit || 0)}
              </span>
            </div>
          </div>

          {/* Core Properties Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Brand
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.brand || "Unbranded"}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Category
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.item_type || "Uncategorized"}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Location
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.location || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                  Supplier
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.supplier || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* ─── Cart & Quantity Module ────────────────────────────────────────── */}
          {onAddToCart && (
            <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 mt-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Available Stock
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {item.balance || 0}
                    </span>
                    <span className="text-sm font-bold text-zinc-400">
                      {item.unit_of_measure || "units"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Min. Stock
                  </span>
                  <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                    {item.min_stock || 0}
                  </span>
                </div>
              </div>

              {status !== "Out Of Stock" ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Unified Quantity Pill */}
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 w-full sm:w-40 shrink-0">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= (item.balance || 0)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Toolbox
                  </button>
                </div>
              ) : (
                <div className="w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold">
                  <XCircle className="w-5 h-5" />
                  Item Currently Unavailable
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
