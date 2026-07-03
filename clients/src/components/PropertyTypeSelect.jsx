import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiHome, HiChevronDown, HiCheck, HiX } from 'react-icons/hi';

const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'villa', label: 'Villa/House' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'commercial', label: 'Commercial' },
];

function PropertyTypeSelect({ value, onChange, s }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const selected = PROPERTY_TYPES.find((t) => t.value === value);

  // track viewport size (sm breakpoint = 640px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }

  // recalculate position whenever the desktop popover is open
  useLayoutEffect(() => {
    if (isOpen && isDesktop) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, isDesktop]);

  // close on outside click (checks both trigger AND portaled panel) + escape
  useEffect(() => {
    function handleClick(e) {
      const clickedTrigger = triggerRef.current?.contains(e.target);
      const clickedPanel = panelRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedPanel) setIsOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // lock body scroll while the sheet/popover is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleSelect(optionValue) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={triggerRef} className={`${s.searchField} relative`}>
      <div className={s.textPrimary}>
        <HiHome size={22} />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={s.dropdownTrigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={s.flexCol}>
          <span className={s.labelSmall}>Property Type</span>
          <span className={s.dropdownValue}>
            {selected ? selected.label : 'Select Type'}
          </span>
        </span>
        <HiChevronDown
          size={18}
          className={`${s.chevronIcon} ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && createPortal(
        <>
          <div className={s.dropdownOverlay} onClick={() => setIsOpen(false)} />

          <div
            ref={panelRef}
            role="listbox"
            className={s.dropdownPanel}
            style={
              isDesktop
                ? { top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 260) }
                : undefined
            }
          >
            <div className={s.dropdownHeader}>
              <span>Select property type</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={s.dropdownCloseBtn}
                aria-label="Close"
              >
                <HiX size={20} />
              </button>
            </div>

            <div className={s.dropdownList}>
              {PROPERTY_TYPES.map((type) => {
                const isActive = type.value === value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(type.value)}
                    className={`${s.dropdownOption} ${isActive ? s.dropdownOptionActive : ''}`}
                  >
                    {type.label}
                    {isActive && <HiCheck size={18} className={s.textPrimary} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default PropertyTypeSelect;
