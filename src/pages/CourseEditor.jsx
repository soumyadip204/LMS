import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiCheck, FiVideo, FiFileText, FiEdit3, FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useCourses } from '../context/CourseContext';
import { CATEGORIES } from '../utils/helpers';
import { toast } from 'react-toastify';
import Loader from '../components/common/Loader';
import './CourseEditor.css';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCourse, createCourse, updateCourse } = useCourses();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Web Development', tags: '',
    thumbnail: '', isPublished: false, whatYouWillLearn: [''],
    modules: []
  });

  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const courseParams = await fetchCourse(id);
      setFormData({
        title: courseParams.title,
        description: courseParams.description,
        category: courseParams.category,
        tags: courseParams.tags?.join(', ') || '',
        thumbnail: courseParams.thumbnail || '',
        isPublished: courseParams.isPublished,
        whatYouWillLearn: courseParams.whatYouWillLearn?.length > 0 ? courseParams.whatYouWillLearn : [''],
        modules: courseParams.modules || []
      });
      // Expand all modules by default
      const exps = {};
      (courseParams.modules || []).forEach((_, i) => exps[i] = true);
      setExpandedModules(exps);
    } catch (err) {
      toast.error('Failed to load course');
      navigate('/instructor');
    }
    setLoading(false);
  };

  const toggleModule = (index) => {
    setExpandedModules(p => ({ ...p, [index]: !p[index] }));
  };

  const handleChange = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  // What You Will Learn helpers
  const updateLearnPoint = (index, val) => {
    const fresh = [...formData.whatYouWillLearn];
    fresh[index] = val;
    handleChange('whatYouWillLearn', fresh);
  };
  
  const addLearnPoint = () => {
    handleChange('whatYouWillLearn', [...formData.whatYouWillLearn, '']);
  };

  const removeLearnPoint = (index) => {
    handleChange('whatYouWillLearn', formData.whatYouWillLearn.filter((_, i) => i !== index));
  };

  // Module helpers
  const addModule = () => {
    const newModules = [...formData.modules, { title: '', order: formData.modules.length + 1, items: [] }];
    handleChange('modules', newModules);
    setExpandedModules(p => ({ ...p, [newModules.length - 1]: true }));
  };

  const updateModuleTitle = (modIndex, title) => {
    const newMods = [...formData.modules];
    newMods[modIndex].title = title;
    handleChange('modules', newMods);
  };

  const removeModule = (modIndex) => {
    handleChange('modules', formData.modules.filter((_, i) => i !== modIndex).map((m, i) => ({ ...m, order: i + 1 })));
  };

  // Item helpers
  const addItem = (modIndex, type) => {
    const newMods = [...formData.modules];
    const baseItem = { type, title: '', duration: 0 };
    
    if (type === 'video' || type === 'documentation') {
      baseItem.url = '';
    } else if (type === 'assignment') {
      baseItem.maxScore = 100;
      baseItem.passingScore = 50;
      baseItem.description = '';
      baseItem.attachmentUrl = '';
      baseItem.time = 0;
    } else if (type === 'quiz') {
      baseItem.maxScore = 0;
      baseItem.passingScore = 50;
      baseItem.time = 0;
      baseItem.shuffleQuestions = false;
      baseItem.questions = [];
    }

    newMods[modIndex].items.push(baseItem);
    handleChange('modules', newMods);
  };

  const updateItem = (modIndex, itemIndex, field, value) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex][field] = value;
    handleChange('modules', newMods);
  };

  const removeItem = (modIndex, itemIndex) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items = newMods[modIndex].items.filter((_, i) => i !== itemIndex);
    handleChange('modules', newMods);
  };

  // Quiz questions helpers
  const addQuestion = (modIndex, itemIndex) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions.push({
      questionText: '',
      type: 'single',
      score: 10,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ],
      explanation: ''
    });
    handleChange('modules', newMods);
  };

  const updateQuestion = (modIndex, itemIndex, qIndex, field, value) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions[qIndex][field] = value;
    handleChange('modules', newMods);
  };

  const removeQuestion = (modIndex, itemIndex, qIndex) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions = newMods[modIndex].items[itemIndex].questions.filter((_, i) => i !== qIndex);
    handleChange('modules', newMods);
  };

  // Quiz option helpers
  const addOption = (modIndex, itemIndex, qIndex) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions[qIndex].options.push({ text: '', isCorrect: false });
    handleChange('modules', newMods);
  };

  const updateOption = (modIndex, itemIndex, qIndex, optIndex, field, value) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions[qIndex].options[optIndex][field] = value;
    handleChange('modules', newMods);
  };

  const removeOption = (modIndex, itemIndex, qIndex, optIndex) => {
    const newMods = [...formData.modules];
    newMods[modIndex].items[itemIndex].questions[qIndex].options = newMods[modIndex].items[itemIndex].questions[qIndex].options.filter((_, i) => i !== optIndex);
    handleChange('modules', newMods);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Title, description, and category are required');
      return;
    }

    setSaving(true);
    try {
      // Auto-recalculate max scores for quizzes right before save
      const computedModules = formData.modules.map(mod => ({
        ...mod,
        items: mod.items.map(item => {
          if (item.type === 'quiz') {
            return {
              ...item,
              maxScore: item.questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0)
            };
          }
          return item;
        })
      }));

      const payload = {
        ...formData,
        modules: computedModules,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim() !== '')
      };

      if (id) {
        await updateCourse(id, payload);
        toast.success('Course updated successfully!');
      } else {
        await createCourse(payload);
        toast.success('Course created successfully!');
        navigate('/instructor');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
    setSaving(false);
  };

  if (loading) return <Loader text="Loading course details..." />;

  const renderItemContent = (item, modIndex, itemIndex) => {
    switch (item.type) {
      case 'video':
      case 'documentation':
        return (
          <div className="item-content-inline">
            <input className="form-input" placeholder={`${item.type === 'video' ? 'YouTube' : 'Doc'} URL`} value={item.url} onChange={e => updateItem(modIndex, itemIndex, 'url', e.target.value)} />
            <input className="form-input num-input" type="number" placeholder="Duration (minutes)" value={item.duration === 0 ? '' : item.duration} onChange={e => updateItem(modIndex, itemIndex, 'duration', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
          </div>
        );
      case 'assignment':
        return (
          <div className="item-content-block">
            <div className="form-row">
              <input className="form-input" type="number" placeholder="Max Score" value={item.maxScore === 0 ? '' : item.maxScore} onChange={e => updateItem(modIndex, itemIndex, 'maxScore', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
              <input className="form-input" type="number" placeholder="Passing Score" value={item.passingScore === 0 ? '' : item.passingScore} onChange={e => updateItem(modIndex, itemIndex, 'passingScore', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
              <input className="form-input" type="number" placeholder="Time limit (minutes)" value={item.time === 0 ? '' : item.time} onChange={e => updateItem(modIndex, itemIndex, 'time', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
            </div>
            <textarea className="form-textarea" placeholder="Assignment description/instructions..." value={item.description} onChange={e => updateItem(modIndex, itemIndex, 'description', e.target.value)} rows={3} />
            <input className="form-input" placeholder="Attachment URL (optional instructions file)" value={item.attachmentUrl} onChange={e => updateItem(modIndex, itemIndex, 'attachmentUrl', e.target.value)} />
          </div>
        );
      case 'quiz':
        const dynamicQuizMaxScore = item.questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
        return (
          <div className="item-content-block">
            <div className="form-row">
              <input className="form-input" type="number" title="Auto-computed by question scores" value={dynamicQuizMaxScore === 0 ? '' : dynamicQuizMaxScore} disabled placeholder="Total Max Score" />
              <input className="form-input" type="number" placeholder="Passing Score" value={item.passingScore === 0 ? '' : item.passingScore} onChange={e => updateItem(modIndex, itemIndex, 'passingScore', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
              <input className="form-input" type="number" placeholder="Time limit (minutes)" value={item.time === 0 ? '' : item.time} onChange={e => updateItem(modIndex, itemIndex, 'time', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} />
            </div>
            <label className="form-checkbox-label" style={{marginBottom: '16px'}}>
              <input type="checkbox" checked={item.shuffleQuestions} onChange={e => updateItem(modIndex, itemIndex, 'shuffleQuestions', e.target.checked)} />
              <span>Shuffle Questions for students</span>
            </label>
            
            <div className="quiz-questions-builder">
              <h4>Questions ({item.questions.length})</h4>
              {item.questions.map((q, qIndex) => (
                <div key={qIndex} className="quiz-question-card">
                  <div className="qq-header">
                    <span className="qq-number">Q{qIndex + 1}</span>
                    <select className="form-select" value={q.type} onChange={e => updateQuestion(modIndex, itemIndex, qIndex, 'type', e.target.value)}>
                      <option value="single">Single Correct</option>
                      <option value="multiple">Multiple Correct</option>
                    </select>
                    <input className="form-input num-input" type="number" placeholder="Score" value={q.score === 0 ? '' : q.score} onChange={e => updateQuestion(modIndex, itemIndex, qIndex, 'score', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))} title="Score for this question" />
                    <button type="button" className="btn-icon text-error" onClick={() => removeQuestion(modIndex, itemIndex, qIndex)}><FiTrash2/></button>
                  </div>
                  
                  <textarea className="form-textarea qq-text" placeholder="Question text..." value={q.questionText} onChange={e => updateQuestion(modIndex, itemIndex, qIndex, 'questionText', e.target.value)} rows={2} />
                  
                  <div className="qq-options">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="qq-option-row">
                        <input 
                          type={q.type === 'single' ? 'radio' : 'checkbox'} 
                          checked={opt.isCorrect} 
                          onChange={(e) => {
                            if (q.type === 'single') {
                              // Uncheck others
                              const freshOpts = q.options.map((o, i) => ({...o, isCorrect: i === optIndex}));
                              updateQuestion(modIndex, itemIndex, qIndex, 'options', freshOpts);
                            } else {
                              updateOption(modIndex, itemIndex, qIndex, optIndex, 'isCorrect', e.target.checked);
                            }
                          }}
                          className="qq-option-check"
                        />
                        <input className="form-input" placeholder="Option text" value={opt.text} onChange={e => updateOption(modIndex, itemIndex, qIndex, optIndex, 'text', e.target.value)} />
                        {q.options.length > 2 && (
                          <button type="button" className="btn-icon" onClick={() => removeOption(modIndex, itemIndex, qIndex, optIndex)}><FiTrash2/></button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(modIndex, itemIndex, qIndex)}>+ Add Option</button>
                  </div>

                  <input className="form-input qq-explain" placeholder="Explanation (shown after submission)..." value={q.explanation} onChange={e => updateQuestion(modIndex, itemIndex, qIndex, 'explanation', e.target.value)} />
                </div>
              ))}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => addQuestion(modIndex, itemIndex)}>+ Add Question</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="text-secondary" />;
      case 'documentation': return <FiFileText className="text-info" />;
      case 'assignment': return <FiEdit3 className="text-primary" />;
      case 'quiz': return <FiHelpCircle className="text-warning" />;
      default: return null;
    }
  };

  return (
    <div className="course-editor-page page-enter">
      <div className="editor-topbar">
        <div className="container">
          <button className="btn-icon" onClick={() => navigate('/instructor')}><FiArrowLeft size={20} /></button>
          <h2>{id ? 'Edit Course' : 'Create New Course'}</h2>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      <div className="container editor-body">
        <form className="editor-main" onSubmit={(e) => e.preventDefault()}>
          
          <div className="editor-card basis-card">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input className="form-input" placeholder="e.g. Complete React.js Bootcamp" value={formData.title} onChange={e => handleChange('title', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" placeholder="Detailed description of the course..." value={formData.description} onChange={e => handleChange('description', e.target.value)} required rows={4} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" placeholder="react, javascript, web" value={formData.tags} onChange={e => handleChange('tags', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thumbnail URL (optional)</label>
              <input className="form-input" placeholder="https://example.com/image.jpg" value={formData.thumbnail} onChange={e => handleChange('thumbnail', e.target.value)} />
              {formData.thumbnail && (
                <div className="thumb-preview mt-2">
                  <img src={formData.thumbnail} alt="Preview" style={{maxHeight: '120px', borderRadius: '8px'}} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">What You'll Learn (Bullet Points)</label>
              {formData.whatYouWillLearn.map((point, i) => (
                <div key={i} className="learn-point-row mb-2" style={{display: 'flex', gap: '8px'}}>
                  <input className="form-input" placeholder={`Point ${i+1}`} value={point} onChange={e => updateLearnPoint(i, e.target.value)} />
                  {formData.whatYouWillLearn.length > 1 && (
                    <button type="button" className="btn-icon" onClick={() => removeLearnPoint(i)}><FiTrash2/></button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={addLearnPoint}>+ Add Point</button>
            </div>
            
            <div className="form-group mb-0">
              <label className="form-checkbox-label">
                <input type="checkbox" checked={formData.isPublished} onChange={e => handleChange('isPublished', e.target.checked)} />
                <span>Publish this course to learners</span>
              </label>
            </div>
          </div>

          <div className="editor-card modules-card">
            <div className="modules-header">
              <h3>Curriculum Modules</h3>
              <button type="button" className="btn btn-primary" onClick={addModule}>
                <FiPlus /> Add Module
              </button>
            </div>

            {formData.modules.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={40} />
                <p>No modules added yet. Organise your course by adding modules.</p>
              </div>
            ) : (
              formData.modules.map((module, modIndex) => (
                <div key={modIndex} className="module-builder">
                  <div className="module-b-header">
                    <div className="mb-title-area">
                      <span className="mb-number">M{modIndex + 1}</span>
                      <input className="form-input" placeholder="Module Title" value={module.title} onChange={e => updateModuleTitle(modIndex, e.target.value)} />
                    </div>
                    <div className="mb-actions">
                      <button type="button" className="btn-icon text-muted" onClick={() => toggleModule(modIndex)}>
                        {expandedModules[modIndex] ? <FiChevronUp/> : <FiChevronDown/>}
                      </button>
                      <button type="button" className="btn-icon text-error" onClick={() => removeModule(modIndex)}><FiTrash2/></button>
                    </div>
                  </div>

                  {expandedModules[modIndex] && (
                    <div className="module-b-content">
                      <div className="mb-items">
                        {module.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="mb-item-card">
                            <div className="mb-item-header">
                              <div className="mb-item-title">
                                {getItemIcon(item.type)}
                                <span className="mb-item-type-badge">{item.type}</span>
                                <input className="form-input sm-input" placeholder="Item Title" value={item.title} onChange={e => updateItem(modIndex, itemIndex, 'title', e.target.value)} />
                              </div>
                              <button type="button" className="btn-icon text-error" onClick={() => removeItem(modIndex, itemIndex)}><FiTrash2/></button>
                            </div>
                            <div className="mb-item-body">
                              {renderItemContent(item, modIndex, itemIndex)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-add-items">
                        <span>Add Item: </span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem(modIndex, 'video')}><FiVideo/> Video</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem(modIndex, 'documentation')}><FiFileText/> Doc</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem(modIndex, 'assignment')}><FiEdit3/> Assignment</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem(modIndex, 'quiz')}><FiHelpCircle/> Quiz</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default CourseEditor;
