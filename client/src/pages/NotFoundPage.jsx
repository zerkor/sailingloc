import { Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <Anchor size={72} className="mb-6" color="#00C6E0" />
    <h1 className="text-4xl font-bold text-navy-700 mb-4">Page introuvable</h1>
    <p className="text-gray-500 mb-8 max-w-md">
      Cette page a dérivé en haute mer... Retournez à l'accueil pour continuer votre navigation.
    </p>
    <Link to="/" className="btn-primary">Retour à l'accueil</Link>
  </div>
);

export default NotFoundPage;
