import { useState } from 'react';
import { useUpdateWine } from '../hooks/useUpdateWine';

interface TastingNotesEditorProps {
  wineId: string;
  currentNotes: string | null;
}

export function TastingNotesEditor({ wineId, currentNotes }: TastingNotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(currentNotes ?? '');

  const updateMutation = useUpdateWine(wineId);

  function handleEdit() {
    // Pre-fill with current notes when opening editor
    setLocalText(currentNotes ?? '');
    setIsEditing(true);
  }

  function handleCancel() {
    // Revert local text to the value from props (server state)
    setLocalText(currentNotes ?? '');
    setIsEditing(false);
  }

  async function handleSave() {
    // Empty string → send null to clear (server stores '' as null via sanitizeTastingNotes)
    const trimmed = localText.trim();
    try {
      await updateMutation.mutateAsync({ tasting_notes: trimmed || null });
      setIsEditing(false);
    } catch {
      // Error shown via updateMutation.isError below
    }
  }

  const sectionStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    lineHeight: 1.6,
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  if (isEditing) {
    return (
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Tasting Notes</h2>

        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          placeholder="Describe the aromas, flavors, and finish…"
          rows={4}
          style={textareaStyle}
          disabled={updateMutation.isPending}
          autoFocus
          aria-label="Tasting notes"
        />

        {updateMutation.isError && (
          <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>
            Failed to save tasting notes. Please try again.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#7c3aed',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              opacity: updateMutation.isPending ? 0.7 : 1,
            }}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={updateMutation.isPending}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          {currentNotes && (
            <button
              onClick={() => setLocalText('')}
              disabled={updateMutation.isPending}
              style={{
                marginLeft: 'auto',
                fontSize: 13,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear notes
            </button>
          )}
        </div>
      </div>
    );
  }

  // Not editing
  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ ...headingStyle, marginBottom: 0 }}>Tasting Notes</h2>
        <button
          onClick={handleEdit}
          style={{
            fontSize: 13,
            color: '#7c3aed',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {currentNotes ? 'Edit' : 'Add notes'}
        </button>
      </div>

      {currentNotes ? (
        <p style={{ fontSize: 15, color: '#111827', lineHeight: 1.6, margin: 0 }}>
          {currentNotes}
        </p>
      ) : (
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No tasting notes yet.</p>
      )}
    </div>
  );
}
