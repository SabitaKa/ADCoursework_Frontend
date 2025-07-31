import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Footer from "../components/footer";
import { Link, useLocation } from "react-router-dom";
import {
  FaCamera,
  FaUtensils,
  FaHeart,
  FaHeartbeat,
  FaBook,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaCog,
  FaUser
} from "react-icons/fa";
import bpImage from "../assets/bp.jpg";
import alice from "../assets/alice.jpg";
import alchemist from "../assets/alchemist.jpg";
import butter from "../assets/butter.jpg";
import meta from "../assets/meta.jpg";

const Home = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Clear the location state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="font-sans text-gray-800 bg-gray-50 w-full overflow-x-hidden">
      {/* Success message display */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-100 text-green-700 rounded-lg shadow-lg animate-fade-in">
          {successMessage}
        </div>
      )}
      
      {/* New Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 py-16">
        {/* Background with bp.jpg only */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={bpImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            A Home for Readers.
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            Unlock Worlds with Words
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full px-6 py-4 text-lg rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <FaSearch className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Top right icons */}
       
       
      </section>

      {/* Main Content Area */}
      <div className="bg-white">
        {/* Top Bar with Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            
            
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Categories */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {[
                    "Bestsellers",
                    "Award winner",
                    "New Release", 
                    "New Arrivals",
                    "Coming soon",
                    "Deals"
                  ].map((category, index) => (
                    <button
                      key={index}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        index === 0 
                          ? "bg-gray-100 text-gray-800 font-medium" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Book Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "The Alchemist",
                    author: "Paulo Coelho",
                    image: alchemist,
                  },
                  {
                    title: "The Metamorphosis", 
                    author: "Franz Kafka",
                    image: meta,
                  },
                  {
                    title: "The Butterfly Effect",
                    author: "Franz Kafka",
                    image: butter
                  },
                  {
                    title: "Alice in Quantumland",
                    author: "Robert Gilmore",
                    image: alice
                  }
                ].map((book, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{book.title}</h3>
                    <div className="flex items-center mb-2">
                     
                    </div>
                   
                   
                    <p className="text-sm text-gray-600">Novel by {book.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] bg-clip-text text-transparent">
            Featured Genres
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              {
                name: "Arts & Photography",
                icon: <span className="text-4xl mb-2 mx-auto text-purple-500">🎨</span>, // Art Palette
              },
              {
                name: "Food & Drink",
                icon: <span className="text-4xl mb-2 mx-auto text-orange-500">🍕</span>, // Pizza
              },
              {
                name: "Romance",
                icon: <span className="text-4xl mb-2 mx-auto text-pink-500">💕</span>, // Two Hearts
              },
              {
                name: "Health",
                icon: <span className="text-4xl mb-2 mx-auto text-emerald-500">🏥</span>, // Hospital
              },
              {
                name: "Biography",
                icon: <span className="text-4xl mb-2 mx-auto text-indigo-500">👤</span>, // Person
              },
            ].map((category, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center group hover:bg-gradient-to-br from-white to-[#3B6CF7]/10 cursor-pointer"
              >
                <div className="inline-block p-4 rounded-full bg-[#3B6CF7]/10 group-hover:bg-[#3B6CF7]/20 transition-colors duration-300">
                  {category.icon}
                </div>
                <p className="font-semibold text-gray-800 mt-4">
                  {category.name}
                </p>
                <Link to="/BookCatalog">
                  <p className="text-sm text-[#3B6CF7] mt-2 font-medium hover:underline">
                    Shop Now
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestselling Books */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] bg-clip-text text-transparent">
              Top sellers
            </h2>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
            <Link to="/BookCatalog">
              <button className="text-[#3B6CF7] font-semibold hover:underline flex items-center">
                View All <span className="ml-2">→</span>
              </button>
            </Link>
          </div>
          <br />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { image: "bestseller01.jpg", title: "The Mahabharata", genre: "Historical" },
              { image: "bestseller02.jpg", title: "Harry Potter Chamber Secrets", genre: "Fantasy" },
              { image: "bestseller03.jpg", title: "MacBeth", genre: "Tragedy" },
              { image: "bestseller04.jpg", title: "ULYSSES", genre: "Fiction" },
              { image: "bestseller05.jpg", title: "The  Stranger", genre: "Thriller" }
            ].map((book, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative group"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={`/${book.image}`}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg transform transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-[#3B6CF7] text-white px-3 py-1 rounded-full text-xs font-bold">
                    Bestseller
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{book.genre}</p>
                  <p className="font-semibold text-gray-800 mt-1">{book.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[#3B6CF7] font-bold">{book.price}</p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Publishers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] bg-clip-text text-transparent">
            Top Publishers
          </h2>
          <div className="flex overflow-x-auto pb-6 scrollbar-hide space-x-6">
            {[
              {
                name: "HarperCollins",
                img: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Penguin Random House", 
                img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Simon & Schuster",
                img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Macmillan Publishers",
                img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Hachette Book Group",
                img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Sandesh Hari",
                img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Bloomsbury",
                img: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=60"
              },
              {
                name: "Scholastic Inc.",
                img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=60"
              }
            ].map((publisher, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 h-40 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer group"
                style={{
                  backgroundImage: `url('${publisher.img}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <p className="text-white font-semibold text-center text-sm px-4 group-hover:scale-105 group-hover:text-[#3B6CF7] transition-all duration-300">
                    {publisher.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;