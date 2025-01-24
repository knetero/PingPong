import { useState, useRef, useEffect } from 'react';


function ScrollBlur({ children }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const scrollRef = useRef(null);
  
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsScrolled(scrollTop > 0);
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 1);
    };
  
    useEffect(() => {
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
      }
    }, []);
  
    return (
      <div className="relative w-full h-full">
        <div
          ref={scrollRef}
          className="w-full h-full flex flex-col space-y-7 overflow-y-auto scrollbar-hide custom-scrollbar"
          onScroll={handleScroll}
        >
          {children}
        </div>
        <div
          className={`absolute top-0 left-0 right-0 h-16 bg-transparent bg-opacity-50 backdrop-blur-sm pointer-events-none transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-16 bg-transparent bg-opacity-50 backdrop-blur-sm pointer-events-none transition-opacity duration-300 ${
            !isScrolledToBottom ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
      </div>
    );
  };

export default ScrollBlur;