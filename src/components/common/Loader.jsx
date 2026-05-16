import './Loader.css';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="modern-loader-container">
      <div className="loader-core-wrapper">
        <div className="loader-glow"></div>
        <div className="loader-orb"></div>
        <div className="loader-ring loader-ring-1"></div>
        <div className="loader-ring loader-ring-2"></div>
      </div>
      <p className="modern-loader-text">
        {text}
        <span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
      </p>
    </div>
  );
};

export default Loader;
