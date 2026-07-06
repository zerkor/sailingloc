import { createElement, isValidElement } from 'react';

const colorMap = {
  navy:   { bg: '#07192E', accent: '#00C6E0' },
  ocean:  { bg: '#155374', accent: '#4DDFF0' },
  green:  { bg: '#166534', accent: '#86efac' },
  yellow: { bg: '#854d0e', accent: '#fde047' },
  purple: { bg: '#581c87', accent: '#d8b4fe' },
  red:    { bg: '#991b1b', accent: '#fca5a5' },
  cyan:   { bg: '#00C6E0', accent: '#07192E' },
  gold:   { bg: '#C9A84C', accent: '#07192E' },
};

const DashboardCard = ({ title, value, icon: Icon, color = 'navy', subtitle = '' }) => {
  const c = colorMap[color] || colorMap.navy;
  const renderedIcon = isValidElement(Icon)
    ? Icon
    : Icon && typeof Icon !== 'string'
      ? createElement(Icon, { size: 24, strokeWidth: 2.2 })
      : Icon;

  return (
    <div
      className="bg-white rounded-2xl p-6 flex items-center gap-5 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
    >
      {/* Icon bubble */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg, color: c.accent }}
      >
        {renderedIcon}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8896A8' }}>{title}</p>
        <p
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
        >
          {value}
        </p>
        {subtitle && <p className="text-xs mt-1" style={{ color: '#8896A8' }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
