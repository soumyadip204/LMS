import { FiSearch, FiBook, FiUser, FiCreditCard, FiHelpCircle } from 'react-icons/fi';

const HelpCenterPage = () => {
  return (
    <div className="page-enter" style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>How can we help you?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Search our knowledge base or browse categories below to find the answers you need.
          </p>
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search for articles..." 
              style={{ width: '100%', padding: '16px 24px 16px 52px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.1rem' }}
            />
            <FiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {[
            { title: 'Getting Started', desc: 'New to EdStream? Learn the basics.', icon: <FiBook /> },
            { title: 'Account Settings', desc: 'Manage your profile and preferences.', icon: <FiUser /> },
            { title: 'Billing & Payments', desc: 'Invoices, subscriptions, and refunds.', icon: <FiCreditCard /> },
            { title: 'Course Troubleshooting', desc: 'Fix video, quiz, or assignment issues.', icon: <FiHelpCircle /> },
          ].map((cat, i) => (
            <div key={i} style={{ padding: '32px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ width: '64px', height: '64px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--accent-primary)', margin: '0 auto 20px auto' }}>
                {cat.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{cat.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>{cat.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '40px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Still need help?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px auto' }}>Our support team is always ready to assist you with any questions or technical issues.</p>
          <button className="btn btn-primary btn-lg">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
