import { createContext, useContext, useState, useCallback } from 'react';
import API from '../utils/api';

const CourseContext = createContext();

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch published courses (browse)
  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await API.get('/courses', { params });
      setCourses(res.data.courses);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
      return res.data;
    } catch (error) {
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single course
  const fetchCourse = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      setCurrentCourse(res.data.course);
      return res.data.course;
    } catch (error) {
      console.error('Fetch course error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create course (instructor)
  const createCourse = async (courseData) => {
    const res = await API.post('/courses', courseData);
    return res.data;
  };

  // Update course (instructor)
  const updateCourse = async (id, courseData) => {
    const res = await API.put(`/courses/${id}`, courseData);
    return res.data;
  };

  // Delete course
  const deleteCourse = async (id) => {
    const res = await API.delete(`/courses/${id}`);
    setMyCourses((prev) => prev.filter((c) => c._id !== id));
    return res.data;
  };

  // Enroll in course
  const enrollInCourse = async (id) => {
    const res = await API.post(`/courses/${id}/enroll`);
    return res.data;
  };

  // Unenroll from course
  const unenrollFromCourse = async (id) => {
    const res = await API.post(`/courses/${id}/unenroll`);
    setEnrolledCourses((prev) => prev.filter((c) => c._id !== id));
    return res.data;
  };

  // Fetch instructor's courses
  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/courses/my-courses');
      setMyCourses(res.data.courses);
      return res.data.courses;
    } catch (error) {
      console.error('Fetch my courses error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/courses/enrolled');
      setEnrolledCourses(res.data.courses);
      return res.data.courses;
    } catch (error) {
      console.error('Fetch enrolled courses error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    courses,
    myCourses,
    enrolledCourses,
    currentCourse,
    loading,
    pagination,
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    fetchMyCourses,
    fetchEnrolledCourses,
    setCurrentCourse,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export default CourseContext;
