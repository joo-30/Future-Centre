import fs from 'fs';

const filePath = 'Future-Centre/client/src/styles/reference/home.css';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Hero layout and styling improvements
const heroStyles = `
/* ==========================================================================
   HERO DOCTOR SHOWCASE (UI/UX Pro Max Edition)
   ========================================================================== */
.hero-doctor-showcase {
  position: relative;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -40px;
}

.hds-glow-layer {
  position: absolute;
  inset: 12% 10%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 68%);
  filter: blur(44px);
  z-index: 1;
  pointer-events: none;
}

.hds-card {
  position: relative;
  z-index: 2;
  width: 420px;
  height: 530px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8f2 100%);
  border: 1.5px solid rgba(7, 63, 51, 0.12);
  box-shadow: 
    0 24px 60px -12px rgba(7, 63, 51, 0.12),
    0 4px 16px rgba(7, 63, 51, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.hds-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 32px 70px -12px rgba(7, 63, 51, 0.18),
    0 6px 20px rgba(7, 63, 51, 0.06);
}

.hds-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hds-card:hover .hds-photo {
  transform: scale(1.03);
}

.hds-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0) 48%, 
    rgba(255, 255, 255, 0.85) 74%, 
    #ffffff 96%);
  z-index: 3;
  pointer-events: none;
}

.hds-details {
  position: relative;
  z-index: 4;
  padding: 18px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hds-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hds-name {
  font-size: 21px;
  font-weight: 800;
  color: #073f33;
  letter-spacing: -0.4px;
  margin: 0;
}

.hds-verified {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eef7ee;
  border: 1px solid #cce5cc;
  color: #0f5132;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.hds-title {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin: 0;
}

.hds-association {
  font-size: 11.5px;
  color: #687a70;
  margin: 0;
}

/* Floating Stats */
.hds-floating-stat {
  position: absolute;
  z-index: 5;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(7, 63, 51, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12px 30px rgba(7, 63, 51, 0.1);
  border-radius: 16px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.hds-floating-stat:hover {
  transform: translateY(-2px);
}

.stat-cases {
  top: 36px;
  right: -16px;
}

.stat-inbody {
  bottom: 80px;
  left: -20px;
}

.hds-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #eef7ee;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-inbody {
  background: #073f33;
  color: #ffffff;
}

.hds-stat-info {
  display: flex;
  flex-direction: column;
}

.hds-stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hds-stat-num {
  font-size: 15px;
  font-weight: 800;
  color: #073f33;
  font-family: 'Plus Jakarta Sans', 'Alexandria', sans-serif;
}

.hds-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

.hds-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #687a70;
}

@media (max-width: 980px) {
  .hero-doctor-showcase {
    margin-left: 0;
    margin-top: 28px;
    height: auto;
    width: 100%;
    max-width: 380px;
    margin: 28px auto 0;
  }
  .hds-card {
    width: 100%;
    height: 450px;
  }
  .stat-cases {
    top: 14px;
    right: -10px;
  }
  .stat-inbody {
    bottom: 70px;
    left: -10px;
  }
}

@media (max-width: 480px) {
  .hero-doctor-showcase {
    max-width: 330px;
  }
  .hds-card {
    height: 400px;
    border-radius: 22px;
  }
  .hds-details {
    padding: 14px 16px 16px;
  }
  .hds-name {
    font-size: 18px;
  }
  .hds-title {
    font-size: 12px;
  }
  .stat-cases, .stat-inbody {
    padding: 7px 11px;
    border-radius: 12px;
  }
  .hds-stat-num {
    font-size: 13.5px;
  }
  .hds-stat-label {
    font-size: 10px;
  }
}
`;

// Append heroStyles to home.css
content += '\n' + heroStyles;

fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully appended hero-doctor-showcase styles to home.css');
