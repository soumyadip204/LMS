import { useState } from 'react';
import { FiSend, FiMail, FiUser, FiMessageSquare, FiMapPin, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../utils/api';
import './ContactPage.css';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      return toast.error('Please fill in all fields.');
    }
    setSending(true);
    try {
      const res = await API.post('/contact', form);
      toast.success(res.data.message || 'Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    }
    setSending(false);
  };

  return (
    <div className="contact-page page-enter">
      <div className="contact-hero">
        <div className="contact-hero-glow" />
        <div className="container">
          <h1 className="contact-hero-title animate-fade-in">Get in Touch</h1>
          <p className="contact-hero-desc animate-fade-in">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Contact Info Cards */}
        <div className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon"><FiMail size={22} /></div>
            <h3>Email Us</h3>
            <p>support@edstream.com</p>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><FiMapPin size={22} /></div>
            <h3>Location</h3>
            <p>Remote-first, Worldwide</p>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><FiPhone size={22} /></div>
            <h3>Call Us</h3>
            <p>+1 234-567-890</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-card">
          <h2 className="contact-form-title">Send a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label"><FiUser size={14} /> Your Name</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label"><FiMail size={14} /> Your Email</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><FiMessageSquare size={14} /> Subject</label>
              <input className="form-input" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Tell us everything..." rows={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg contact-submit" disabled={sending}>
              <FiSend /> {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
