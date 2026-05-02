const PrivacyPolicyPage = () => {
  return (
    <div className="page-enter" style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last Updated: April 29, 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, purchase a course, or communicate with us. This may include your name, email address, payment information, and course progress data.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>2. How We Use Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending you technical notices, and monitoring engagement and course analytics to enhance the learning experience.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processors), comply with the law, or protect our rights. Course instructors may see your name and progress in their analytics dashboard.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>4. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@edstream.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
