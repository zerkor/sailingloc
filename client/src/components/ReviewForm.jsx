import { useState } from 'react';
import { Star } from 'lucide-react';
import { createReview } from '../services/reviewService';
import ErrorMessage from './ErrorMessage';

const ReviewForm = ({ boatId, bookingId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Veuillez ecrire un commentaire.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createReview({ boatId, bookingId, rating, comment });
      setComment('');
      setRating(5);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-4">
      <h4 className="font-semibold text-gray-900">Laisser un avis</h4>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredStar || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-colors"
                style={{ color: isActive ? '#F4A01A' : '#CBD5E1' }}
                aria-label={`${star} sur 5`}
              >
                <Star size={24} fill={isActive ? 'currentColor' : 'none'} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre experience..."
          className="input-field text-sm"
          required
        />
      </div>
      <ErrorMessage message={error} />
      <button type="submit" disabled={loading} className="btn-primary btn-sm">
        {loading ? 'Envoi...' : "Soumettre l'avis"}
      </button>
    </form>
  );
};

export default ReviewForm;
