import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import { useCourses } from '../context/CourseContext';
import Loader from '../components/common/Loader';
import { CATEGORIES } from '../utils/helpers';
import './BrowsePage.css';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, fetchCourses, loading, pagination } = useCourses();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    params.page = page;
    params.limit = 12;
    fetchCourses(params);
  }, [category, page, fetchCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const params = { page: 1, limit: 12 };
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    fetchCourses(params);
    setSearchParams(search ? { search, category } : { category });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    setSearchParams(search ? { search, category: cat } : { category: cat });
  };

  return (
    <div className="browse-page page-enter">
      <div className="browse-header">
        <div className="container">
          <h1 className="browse-title">Explore Courses</h1>
          <p className="browse-subtitle">
            Discover {pagination.total || ''} courses across multiple categories
          </p>
          <form className="browse-search" onSubmit={handleSearch}>
            <FiSearch className="browse-search-icon" />
            <input
              type="text"
              placeholder="Search courses by title, topic, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="browse-search-input"
              id="browse-search"
            />
            <button type="submit" className="btn btn-primary" id="browse-search-btn">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container browse-content">
        <div className="browse-filters">
          <div className="filter-header">
            <FiFilter size={16} />
            <span>Categories</span>
          </div>
          <div className="filter-tags">
            <button
              className={`filter-tag ${category === 'All' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('All')}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tag ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader text="Fetching courses..." />
        ) : courses.length > 0 ? (
          <>
            <div className="courses-grid">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="browse-pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FiSearch size={48} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
