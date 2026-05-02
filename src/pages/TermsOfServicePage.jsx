const TermsOfServicePage = () => {
  return (
    <div className="page-enter" style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last Updated: April 29, 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using EdStream ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>2. User Accounts</h2>
            <p>You must create an account to access most features. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>3. Course Content & Intellectual Property</h2>
            <p>All courses, videos, and materials provided on the Platform are owned by EdStream or our instructors. You may not reproduce, distribute, or create derivative works from this content without explicit permission.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>4. Code of Conduct</h2>
            <p>Users must behave respectfully in forums and reviews. Harassment, spam, and offensive content are strictly prohibited and may result in immediate account termination.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>5. Refunds</h2>
            <p>We offer a 14-day money-back guarantee for all course purchases, provided you have not completed more than 30% of the course material.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
