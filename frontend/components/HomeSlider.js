import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HomeSlider({ images }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images?.length]);

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-900">
      {images?.map((img, i) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image 
            src={img} 
            alt={`Saigon Landmark ${i + 1}`} 
            fill
            sizes="100vw"
            quality={60}
            style={{ objectFit: 'cover' }}
            className="opacity-50"
            priority={i === 0} 
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
    </div>
  );
}