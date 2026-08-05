import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [], className = '' }) => (
  <nav className={`site-breadcrumb ${className}`.trim()} aria-label="Fil d'Ariane">
    <Link to="/" className="site-breadcrumb__home">
      <Home size={14} />
      <span>Accueil</span>
    </Link>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      return (
        <span key={`${item.label}-${index}`} className="site-breadcrumb__item">
          <ChevronRight size={14} aria-hidden="true" />
          {item.to && !isLast ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
          )}
        </span>
      );
    })}
  </nav>
);

export default Breadcrumb;
