import {
  Camera,
  Check,
  ChevronDown,
  Phone,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { UserPublic } from '@future/shared';
import { rankByRelevance } from '@future/shared';

interface PatientSearchSelectProps {
  patients: UserPublic[];
  selectedId: string;
  onSelect: (patientId: string) => void;
  onScanClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PatientSearchSelect({
  patients,
  selectedId,
  onSelect,
  onScanClick,
  placeholder = 'ابحثي باسم المريض، رقم الهاتف، أو رقم الملف...',
  disabled = false,
}: PatientSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedId),
    [patients, selectedId]
  );

  const filteredPatients = useMemo(() => {
    if (!query || !query.trim()) return patients;
    return rankByRelevance(
      patients,
      query,
      (p) => p.name,
      (p) => p.phone,
      undefined,
      (p) => p.fileNumber,
    );
  }, [patients, query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className="patient-search-select-wrap" ref={containerRef}>
      <div className="pss-controls-row">
        {selectedPatient ? (
          /* Selected Patient Card Preview */
          <div
            className={`pss-trigger has-value ${open ? 'is-open' : ''}`}
            onClick={() => !disabled && setOpen(!open)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (!disabled) setOpen(!open);
              }
            }}
          >
            <div className="pss-selected-preview">
              <span className="pss-avatar-circle">
                {selectedPatient.name.slice(0, 1)}
              </span>
              <div className="pss-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <strong className="pss-name">{selectedPatient.name}</strong>
                  {selectedPatient.fileNumber && (
                    <span className="pss-file-badge">ملف #{selectedPatient.fileNumber}</span>
                  )}
                </div>
                <span className="pss-phone-badge">
                  <Phone size={11} />
                  <bdi dir="ltr">{selectedPatient.phone}</bdi>
                </span>
              </div>
            </div>

            <div className="pss-trigger-actions">
              <span
                role="button"
                tabIndex={0}
                className="pss-clear-btn"
                title="إلغاء التحديد وتغيير المريض"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect('');
                  setQuery('');
                  setOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onSelect('');
                    setQuery('');
                    setOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }}
              >
                <X size={14} />
              </span>
              <button
                type="button"
                className="pss-chevron-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setOpen(!open);
                }}
                aria-label="تغيير المريض"
              >
                <ChevronDown size={16} className={`pss-chevron ${open ? 'is-rotated' : ''}`} />
              </button>
            </div>
          </div>
        ) : (
          /* Live Interactive Auto-Search Input */
          <div
            className={`pss-trigger pss-search-mode ${open ? 'is-open' : ''}`}
            onClick={() => {
              if (!disabled) {
                searchInputRef.current?.focus();
                if (!open) setOpen(true);
              }
            }}
          >
            <div className="pss-input-flex-row">
              <User size={16} className="pss-icon-placeholder" />
              <input
                ref={searchInputRef}
                type="text"
                className="pss-main-search-input"
                placeholder={placeholder}
                value={query}
                disabled={disabled}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!open) setOpen(true);
                }}
                onFocus={() => {
                  if (!open) setOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setOpen(false);
                  } else if (e.key === 'Enter' && filteredPatients.length > 0) {
                    e.preventDefault();
                    onSelect(filteredPatients[0].id);
                    setOpen(false);
                    setQuery('');
                  }
                }}
              />
            </div>

            <div className="pss-trigger-actions">
              {query && (
                <span
                  role="button"
                  tabIndex={0}
                  className="pss-clear-btn"
                  title="مسح البحث"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      setQuery('');
                      searchInputRef.current?.focus();
                    }
                  }}
                >
                  <X size={14} />
                </span>
              )}
              <button
                type="button"
                className="pss-chevron-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setOpen(!open);
                }}
                aria-label="عرض قائمة المرضى"
              >
                <ChevronDown size={16} className={`pss-chevron ${open ? 'is-rotated' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Quick QR Scanner Button */}
        {onScanClick && (
          <button
            type="button"
            className="pss-scan-qr-btn"
            onClick={onScanClick}
            title="مسح كود QR للمريض بالكاميرا"
            aria-label="مسح كود QR للمريض"
          >
            <Camera size={16} />
            <span>مسح QR</span>
          </button>
        )}
      </div>

      {/* Popover Dropdown Menu */}
      {open && (
        <div className="pss-dropdown-menu" role="listbox">
          {/* List of Patients */}
          <div className="pss-options-list">
            {filteredPatients.length === 0 ? (
              <div className="pss-empty-msg">
                <User size={20} />
                <span>لا يوجد مريض مطابق لـ "{query}"</span>
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`pss-option-item ${isSelected ? 'is-active' : ''}`}
                    onClick={() => {
                      onSelect(p.id);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <span className="pss-item-avatar">{p.name.slice(0, 1)}</span>
                    <div className="pss-item-info">
                      <div className="pss-item-top">
                        <strong className="pss-item-name">{p.name}</strong>
                        {p.fileNumber && (
                          <span className="pss-file-badge">ملف #{p.fileNumber}</span>
                        )}
                        <span className="pss-role-tag">حساب مريض</span>
                      </div>
                      <span className="pss-item-phone">
                        <Phone size={11} />
                        <bdi dir="ltr">{p.phone}</bdi>
                      </span>
                    </div>
                    {isSelected && (
                      <span className="pss-check-circle">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
