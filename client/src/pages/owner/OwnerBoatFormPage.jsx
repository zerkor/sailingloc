import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { createBoat, updateBoat, getBoatById } from '../../services/boatService';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';

const EQUIPMENT_OPTIONS = [
  'GPS',
  'VHF',
  'Radar',
  'Pilote automatique',
  'Sondeur',
  'Gilets de sauvetage',
  'Radeau de survie',
  'EPIRB',
  'Annexe',
  'Cuisine équipée',
  'Douche',
  'Eau chaude',
  'Climatisation',
  'Bluetooth / Musique',
  'Bimini',
  'Génois',
  'Spi',
  'WiFi',
  'Snorkeling',
  'Kayak / SUP',
];

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
    <h2
      className="font-bold text-base mb-5 pb-3"
      style={{ fontFamily: "'Playfair Display', serif", color: '#07192E', borderBottom: '1px solid #EDF1F5' }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-bold uppercase tracking-wider mb-2"
    style={{ color: '#3D4D61' }}
  >
    {children}
  </label>
);

const resizeImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1400;
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.onerror = () => reject(new Error("Impossible de lire l'image."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Impossible de charger l'image."));
    reader.readAsDataURL(file);
  });

const OwnerBoatFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'sailboat',
    location: '',
    port: '',
    pricePerDay: '',
    capacity: '',
    length: '',
    engine: '',
    skipperAvailable: false,
    images: [''],
    equipments: [],
    unavailableDates: [''],
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getBoatById(id)
      .then(({ data }) =>
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'sailboat',
          location: data.location || '',
          port: data.port || '',
          pricePerDay: data.pricePerDay || '',
          capacity: data.capacity || '',
          length: data.length || '',
          engine: data.engine || '',
          skipperAvailable: data.skipperAvailable || false,
          images: data.images?.length ? data.images : [''],
          equipments: data.equipments || [],
          unavailableDates: data.unavailableDates?.length
            ? data.unavailableDates.map((date) => new Date(date).toISOString().split('T')[0])
            : [''],
        })
      )
      .catch(() => setError('Impossible de charger ce bateau.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleImageChange = (i, v) => {
    const imgs = [...form.images];
    imgs[i] = v;
    setForm((prev) => ({ ...prev, images: imgs }));
  };
  const addImage = () => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
  const removeImage = (i) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploadingImages(true);
    setError('');
    try {
      const urls = await Promise.all(files.map((file) => resizeImageAsDataUrl(file)));
      setForm((prev) => ({ ...prev, images: [...prev.images.filter(Boolean), ...urls].slice(0, 8) }));
    } catch (err) {
      setError(err.message || 'Impossible de préparer les images.');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };
  const handleUnavailableDateChange = (i, v) => {
    const dates = [...form.unavailableDates];
    dates[i] = v;
    setForm((prev) => ({ ...prev, unavailableDates: dates }));
  };
  const addUnavailableDate = () => setForm((prev) => ({ ...prev, unavailableDates: [...prev.unavailableDates, ''] }));
  const removeUnavailableDate = (i) =>
    setForm((prev) => ({ ...prev, unavailableDates: prev.unavailableDates.filter((_, idx) => idx !== i) }));
  const toggleEq = (eq) =>
    setForm((prev) => ({
      ...prev,
      equipments: prev.equipments.includes(eq) ? prev.equipments.filter((e) => e !== eq) : [...prev.equipments, eq],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      pricePerDay: Number(form.pricePerDay),
      capacity: Number(form.capacity),
      length: form.length ? Number(form.length) : undefined,
      images: form.images.filter(Boolean),
      unavailableDates: [...new Set(form.unavailableDates.filter(Boolean))],
    };
    try {
      if (isEdit) await updateBoat(id, payload);
      else await createBoat(payload);
      navigate('/owner/boats');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner text="Chargement…" />;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
        {isEdit ? 'Modifier le bateau' : 'Ajouter un bateau'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General info */}
        <Section title="Informations générales">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre de l'annonce *</Label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex : Voilier Sun Odyssey 36"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="Décrivez votre bateau…"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <select id="type" name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option value="sailboat">Voilier</option>
                  <option value="motorboat">Bateau à moteur</option>
                  <option value="catamaran">Catamaran</option>
                  <option value="rib">Semi-rigide</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Marseille"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="port">Port d'attache</Label>
              <input
                id="port"
                type="text"
                name="port"
                value={form.port}
                onChange={handleChange}
                className="input-field"
                placeholder="Vieux-Port de Marseille"
              />
            </div>
          </div>
        </Section>

        {/* Specs */}
        <Section title="Caractéristiques">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="pricePerDay">Prix/jour (€) *</Label>
              <input
                id="pricePerDay"
                type="number"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacité (pers.) *</Label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <Label htmlFor="length">Longueur (m)</Label>
              <input
                id="length"
                type="number"
                name="length"
                value={form.length}
                onChange={handleChange}
                className="input-field"
                min="1"
                step="0.1"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="engine">Motorisation</Label>
            <input
              id="engine"
              type="text"
              name="engine"
              value={form.engine}
              onChange={handleChange}
              className="input-field"
              placeholder="Yanmar 21cv"
            />
          </div>
          <label
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all w-fit"
            style={
              form.skipperAvailable
                ? { background: 'rgba(0,198,224,0.1)', border: '1.5px solid rgba(0,198,224,0.3)' }
                : { background: '#EDF1F5', border: '1.5px solid transparent' }
            }
          >
            <input
              id="skipper"
              type="checkbox"
              name="skipperAvailable"
              checked={form.skipperAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#00C6E0' }}
            />
            <span className="text-sm font-medium" style={{ color: '#07192E' }}>
              Skipper disponible
            </span>
          </label>
        </Section>

        {/* Images */}
        <Section title="Photos">
          <div className="mb-4 rounded-xl p-4" style={{ background: '#F7F9FB', border: '1px solid #EDF1F5' }}>
            <Label htmlFor="boat-images">Importer des photos</Label>
            <input
              id="boat-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm"
              disabled={uploadingImages}
            />
            <p className="text-xs mt-2" style={{ color: '#8896A8' }}>
              JPG, PNG ou WebP. Les photos sont compressées puis sauvegardées avec l'annonce.
            </p>
          </div>
          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => handleImageChange(i, e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://images.unsplash.com/…"
                />
                {img && <img src={img} alt="" className="h-10 w-14 rounded-lg object-cover" />}
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 inline-flex items-center"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {form.images.length < 5 && (
              <button
                type="button"
                onClick={addImage}
                className="text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:bg-[#EDF1F5]"
                style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
              >
                + Ajouter une photo
              </button>
            )}
            {uploadingImages && (
              <p className="text-xs font-semibold" style={{ color: '#00AFC8' }}>
                Préparation des photos...
              </p>
            )}
          </div>
        </Section>

        {/* Availability */}
        <Section title="Disponibilités">
          <div className="space-y-2">
            {form.unavailableDates.map((date, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleUnavailableDateChange(i, e.target.value)}
                  className="input-field flex-1"
                />
                {form.unavailableDates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUnavailableDate(i)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 inline-flex items-center"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addUnavailableDate}
              className="text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:bg-[#EDF1F5]"
              style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
            >
              + Ajouter une date indisponible
            </button>
          </div>
        </Section>

        {/* Equipment */}
        <Section title="Équipements">
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEq(eq)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={
                  form.equipments.includes(eq)
                    ? { background: '#07192E', color: '#fff', borderColor: '#07192E' }
                    : { background: '#fff', color: '#3D4D61', borderColor: 'rgba(7,25,46,0.15)' }
                }
              >
                {form.equipments.includes(eq) && <Check size={13} className="inline mr-1" />}
                {eq}
              </button>
            ))}
          </div>
        </Section>

        <ErrorMessage message={error} />

        <div className="flex gap-3 pb-4">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#07192E', color: '#fff' }}
          >
            {uploadingImages
              ? 'Préparation des photos...'
              : loading
                ? 'Sauvegarde…'
                : isEdit
                  ? 'Enregistrer les modifications'
                  : 'Publier le bateau'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/owner/boats')}
            className="px-8 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-[#EDF1F5]"
            style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerBoatFormPage;
