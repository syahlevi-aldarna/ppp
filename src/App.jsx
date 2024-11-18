import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, Volume1, VolumeX, 
  Maximize, SkipBack, SkipForward, Settings
} from 'lucide-react';

const VideoPlayer = () => {
  // State dan refs
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef(null);
  const [currentVideo, setCurrentVideo] = useState(0);

  // Data video contoh
  const videos = [
    {
      title: "#1",
      src: "/videos/video1.mp4", // Path file video di folder `public/videos`
      thumbnail: "/thumbnails/thumb1.jpg" // Opsional, untuk poster/thumbnail
    },
    {
      title: "#2",
      src: "/videos/video2.mp4",
      thumbnail: "/thumbnails/thumb2.jpg"
    }
  ];
  

  // Memperbarui status layar penuh saat keluar menggunakan tombol Esc
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Menangani pemuatan metadata video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setCurrentTime(0);
      setProgress(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [currentVideo]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Kesalahan memutar video:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Kesalahan saat mengubah mode layar penuh:', error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div 
        className="relative group bg-black rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videos[currentVideo].src}
          poster={videos[currentVideo].thumbnail}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Kontrol Video */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Bar Progres */}
          <div className="relative w-full h-1 bg-gray-600 rounded cursor-pointer">
            <input
              type="range"
              className="absolute w-full h-full opacity-0 cursor-pointer"
              value={progress}
              onChange={handleProgressChange}
              min="0"
              max="100"
              step="0.1"
            />
            <div 
              className="h-full bg-blue-500 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Tombol Kontrol */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-blue-500 transition-colors"
                title={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? 
                  <Pause className="w-6 h-6" /> : 
                  <Play className="w-6 h-6" />
                }
              </button>
              
              <button 
                onClick={skipBackward}
                className="text-white hover:text-blue-500 transition-colors"
                title="Mundur 10 detik"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button 
                onClick={skipForward}
                className="text-white hover:text-blue-500 transition-colors"
                title="Maju 10 detik"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-blue-500 transition-colors"
                  title={isMuted ? "Suarakan" : "Bisukan"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : 
                   volume > 0.5 ? <Volume2 className="w-5 h-5" /> : 
                   <Volume1 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  className="w-20"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  min="0"
                  max="1"
                  step="0.1"
                  title="Atur volume"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-500 transition-colors"
                title="Layar Penuh"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Overlay Putar/Jeda */}
        {!isPlaying && (
          <button 
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors"
            title="Putar"
          >
            <Play className="w-12 h-12 text-white" />
          </button>
        )}
      </div>

      {/* Daftar Putar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div 
            key={index}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
              currentVideo === index ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => {
              setCurrentVideo(index);
              setIsPlaying(false);
            }}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-2 bg-gray-800">
              <p className="text-sm text-white truncate">{video.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
