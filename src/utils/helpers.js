// Extract YouTube video ID from various URL formats
export const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Get YouTube thumbnail
export const getYouTubeThumbnail = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export const formatDate = (date) => {
  if (!date) return 'Today';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Today';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Generate avatar from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Course categories
export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'UI/UX Design',
  'DevOps',
  'Cybersecurity',
  'Other',
];

// Category icons mapping
export const CATEGORY_ICONS = {
  'Web Development': '🌐',
  'Mobile Development': '📱',
  'Data Science': '📊',
  'Machine Learning': '🤖',
  'UI/UX Design': '🎨',
  'DevOps': '⚙️',
  'Cybersecurity': '🔒',
  'Other': '📚',
};
