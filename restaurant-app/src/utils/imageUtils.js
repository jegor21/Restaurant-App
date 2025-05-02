const randomImages = [
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5",
    "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
    "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6"
  ];
  
  export const getImageForRestaurant = (id) => {
    if (!id) return randomImages[0];
    const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return randomImages[hash % randomImages.length];
  };
        