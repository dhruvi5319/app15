import { useState } from 'react';
import type { CreateWineInput, UpdateWineInput, Wine } from '../types/wine.types';

// Union type: form can be used for both create and update
type WineFormValues = {
  name: string;
  producer: string;
  vintage: string;      // string in form, converted to number | null on submit
  varietal: string;
  region: string;
  bottle_count: string; // string in form, converted to number on submit
  tasting_notes: string;
  rating: string;       // string in form, converted to number | null on submit
};

interface WineFormProps {
  initialValues?: Partial<Wine>;
  onSubmit: (data: CreateWineInput | UpdateWineInput) => void;
  isLoading: boolean;
  error?: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

function toFormValues(wine?: Partial<Wine>): WineFormValues {
  return {
    name: wine?.name ?? '',
    producer: wine?.producer ?? '',
    vintage: wine?.vintage !== null && wine?.vintage !== undefined ? String(wine.vintage) : '',
    varietal: wine?.varietal ?? '',
    region: wine?.region ?? '',
    bottle_count: wine?.bottle_count !== undefined ? String(wine.bottle_count) : '1',
    tasting_notes: wine?.tasting_notes ?? '',
    rating: wine?.rating !== null && wine?.rating !== undefined ? String(wine.rating) : '',
  };
}

const CURRENT_YEAR = new Date().getFullYear();

export function WineForm({
  initialValues,
  onSubmit,
  isLoading,
  error,
  submitLabel = 'Save Wine',
  onCancel,
}: WineFormProps) {
  const [values, setValues] = useState<WineFormValues>(toFormValues(initialValues));
  const [validationError, setValidationError] = useState<string | null>(null);

  function set(field: keyof WineFormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation
    const name = values.name.trim();
    if (!name) {
      setValidationError('Wine name is required.');
      return;
    }

    let vintage: number | null = null;
    if (values.vintage) {
      const v = parseInt(values.vintage, 10);
      if (isNaN(v) || v < 1800 || v > CURRENT_YEAR + 5) {
        setValidationError(`Vintage must be between 1800 and ${CURRENT_YEAR + 5}.`);
        return;
      }
      vintage = v;
    }

    let rating: number | null = null;
    if (values.rating) {
      const r = parseInt(values.rating, 10);
      if (isNaN(r) || r < 1 || r > 5) {
        setValidationError('Rating must be between 1 and 5.');
        return;
      }
      rating = r;
    }

    let bottle_count = 1;
    if (values.bottle_count) {
      const bc = parseInt(values.bottle_count, 10);
      if (isNaN(bc) || bc < 1 || bc > 9999) {
        setValidationError('Bottle count must be between 1 and 9999.');
        return;
      }
      bottle_count = bc;
    }

    const data: CreateWineInput = {
      name,
      producer: values.producer.trim() || null,
      vintage,
      varietal: values.varietal.trim() || null,
      region: values.region.trim() || null,
      bottle_count,
      tasting_notes: values.tasting_notes.trim() || null,
      rating,
    };

    onSubmit(data);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Name — required */}
      <div style={fieldStyle}>
        <label htmlFor="wine-name" style={labelStyle}>
          Wine Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="wine-name"
          type="text"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Opus One"
          style={inputStyle}
          disabled={isLoading}
          autoFocus
        />
      </div>

      {/* Producer */}
      <div style={fieldStyle}>
        <label htmlFor="wine-producer" style={labelStyle}>Producer</label>
        <input
          id="wine-producer"
          type="text"
          value={values.producer}
          onChange={(e) => set('producer', e.target.value)}
          placeholder="e.g. Robert Mondavi"
          style={inputStyle}
          disabled={isLoading}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Vintage */}
        <div style={fieldStyle}>
          <label htmlFor="wine-vintage" style={labelStyle}>Vintage</label>
          <input
            id="wine-vintage"
            type="number"
            value={values.vintage}
            onChange={(e) => set('vintage', e.target.value)}
            placeholder="e.g. 2018"
            min={1800}
            max={CURRENT_YEAR + 5}
            style={inputStyle}
            disabled={isLoading}
          />
        </div>

        {/* Bottle Count */}
        <div style={fieldStyle}>
          <label htmlFor="wine-bottle-count" style={labelStyle}>Bottle Count</label>
          <input
            id="wine-bottle-count"
            type="number"
            value={values.bottle_count}
            onChange={(e) => set('bottle_count', e.target.value)}
            min={1}
            max={9999}
            style={inputStyle}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Varietal */}
      <div style={fieldStyle}>
        <label htmlFor="wine-varietal" style={labelStyle}>Varietal</label>
        <input
          id="wine-varietal"
          type="text"
          value={values.varietal}
          onChange={(e) => set('varietal', e.target.value)}
          placeholder="e.g. Cabernet Sauvignon"
          style={inputStyle}
          disabled={isLoading}
        />
      </div>

      {/* Region */}
      <div style={fieldStyle}>
        <label htmlFor="wine-region" style={labelStyle}>Region</label>
        <input
          id="wine-region"
          type="text"
          value={values.region}
          onChange={(e) => set('region', e.target.value)}
          placeholder="e.g. Napa Valley"
          style={inputStyle}
          disabled={isLoading}
        />
      </div>

      {/* Tasting Notes */}
      <div style={fieldStyle}>
        <label htmlFor="wine-tasting-notes" style={labelStyle}>Tasting Notes</label>
        <textarea
          id="wine-tasting-notes"
          value={values.tasting_notes}
          onChange={(e) => set('tasting_notes', e.target.value)}
          placeholder="Aromas, flavors, finish…"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          disabled={isLoading}
        />
      </div>

      {/* Rating (1-5 stars) */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Rating (1–5 stars)</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const currentRating = parseInt(values.rating, 10) || 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => set('rating', values.rating === String(star) ? '' : String(star))}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                aria-pressed={currentRating === star}
                disabled={isLoading}
                style={{
                  fontSize: 24,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  color: star <= currentRating ? '#d97706' : '#d1d5db',
                }}
              >
                ★
              </button>
            );
          })}
          {values.rating && (
            <button
              type="button"
              onClick={() => set('rating', '')}
              style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Validation / server error */}
      {(validationError || error) && (
        <div
          role="alert"
          style={{
            color: '#dc2626',
            padding: '10px 14px',
            border: '1px solid #fca5a5',
            borderRadius: 6,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {validationError || error}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#7c3aed',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
