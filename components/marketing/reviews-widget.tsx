"use client";

import { useState, useEffect } from "react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
}

export default function ReviewsWidget() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll mock the reviews. 
    // In production, this would call /api/reviews which uses the Google Places API.
    const mockReviews: Review[] = [
      {
        author_name: "Amit Desai",
        rating: 5,
        text: "Excellent service! The Kundli generation was very accurate and the shop owner is very polite.",
        time: 1715438814,
        profile_photo_url: "https://ui-avatars.com/api/?name=Amit+Desai&background=random"
      },
      {
        author_name: "Priya Sharma",
        rating: 5,
        text: "Got my PAN card done very quickly. The digital astrology features are a great bonus!",
        time: 1715000000,
        profile_photo_url: "https://ui-avatars.com/api/?name=Priya+Sharma&background=random"
      },
      {
        author_name: "Rahul Verma",
        rating: 4,
        text: "Very convenient digital seva kendra in Bhayandar. Also tried the Kundli matching, highly recommend.",
        time: 1714000000,
        profile_photo_url: "https://ui-avatars.com/api/?name=Rahul+Verma&background=random"
      }
    ];
    
    setReviews(mockReviews);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">What Our Customers Say</h2>
          <div className="flex justify-center items-center gap-2">
            <span className="text-yellow-500 text-2xl">★★★★★</span>
            <span className="text-slate-300">4.9/5 from 120+ Google Reviews</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex text-yellow-500 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-6 line-clamp-4">"{review.text}"</p>
              </div>
              <div className="flex items-center gap-3">
                <img src={review.profile_photo_url} alt={review.author_name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-white text-sm font-medium">{review.author_name}</p>
                  <p className="text-slate-500 text-xs">Local Guide</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="https://search.google.com/local/writereview?placeid=ChIJo-F0XQ6w5zsRDAxgsIiyjCY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Review us on Google
          </a>
        </div>
      </div>
    </section>
  );
}
