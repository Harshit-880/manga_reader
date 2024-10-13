import React, { useState, useEffect } from 'react';

interface Book {
  id: number;
  title: string;
  chapter_ids: number[];
}

interface Page {
  id: number;
  page_index: number;
  image: {
    id: number;
    file: string;
    width: number;
    height: number;
  };
}

const BookButtons: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Fetch books on component load
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://52.195.171.228:8080/books/');
        const data: Book[] = await response.json();
        setBooks(data);
        if (data.length > 0) {
          setSelectedBook(data[0]);
          setSelectedChapter(0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(0); // reset chapter selection to the first chapter
    setCurrentPageIndex(0); // reset to the first page
  };

  useEffect(() => {
    const fetchPages = async () => {
      if (selectedBook && selectedChapter !== null) {
        try {
          const chapterId = selectedBook.chapter_ids[selectedChapter];
          const response = await fetch(`http://52.195.171.228:8080/chapters/${chapterId}/`);
          const data = await response.json();
          setPages(data.pages); // Use the pages array from the response
          setCurrentPageIndex(0); // Reset to the first page of the chapter
        } catch (error) {
          console.error('Error fetching pages:', error);
        }
      }
    };

    fetchPages();
  }, [selectedBook, selectedChapter]);

  const handleChapterClick = (index: number) => {
    setSelectedChapter(index);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const imageWidth = e.currentTarget.clientWidth;
    const clickPositionX = e.nativeEvent.offsetX;

    if (clickPositionX < imageWidth / 2) {
        nextPage();
    } else {
      previousPage();
    }
  };

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prevIndex) => prevIndex + 1);
    } else if (selectedChapter !== null && selectedChapter < selectedBook.chapter_ids.length - 1) {
      // Move to the next chapter
      const nextChapter = selectedChapter + 1;
      setSelectedChapter(nextChapter);
      setCurrentPageIndex(0); // Reset to the first page of the new chapter
    }
  };

  const previousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prevIndex) => prevIndex - 1);
    } else if (selectedChapter !== null && selectedChapter > 0) {
      // Move to the last page of the previous chapter
      const previousChapter = selectedChapter - 1;
      setSelectedChapter(previousChapter);
      setCurrentPageIndex(pages.length - 1); // Set to the last page of the previous chapter
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7fafc', // Light gray background
        padding: '16px', // Add some padding
      }}
    >
      {/* Book List */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => handleBookClick(book)}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedBook?.id === book.id ? '#4299e1' : '#ffffff',
              color: selectedBook?.id === book.id ? 'white' : 'black',
              border: '1px solid #cbd5e0',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            {book.title}
          </button>
        ))}
      </div>

      {selectedBook && selectedBook.chapter_ids.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          {/* Chapter Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {selectedBook.chapter_ids.map((_, index) => (
              <button
                key={index}
                onClick={() => handleChapterClick(index)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedChapter === index ? '#4299e1' : '#ffffff',
                  color: selectedChapter === index ? 'white' : 'black',
                  border: '1px solid #cbd5e0',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Chapter {index + 1}
              </button>
            ))}
          </div>

          {selectedChapter !== null && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Image Viewer */}
              {pages.length > 0 && (
                <div style={{ position: 'relative', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={pages[currentPageIndex]?.image.file}
                    alt={`Page ${currentPageIndex + 1}`}
                    style={{
                      maxWidth: '70%',
                      maxHeight: '90vh',
                      cursor: 'pointer',
                      objectFit: 'contain',
                      margin: '0 auto', // This centers the image in its container
                    }}
                    onClick={handleImageClick}
                  />
                </div>
              )}
              {/* Page counter - moved below the image */}
              {pages.length > 0 && (
                <div style={{ color: '#4a5568', marginTop: '10px' }}>
                  {currentPageIndex + 1} / {pages.length}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookButtons;
