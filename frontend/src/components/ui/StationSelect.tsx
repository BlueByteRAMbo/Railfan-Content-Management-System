import React from 'react';
import AsyncSelect from 'react-select/async';
import { referenceApi } from '../../api/services';

type Option = { value: number; label: string };

const toOption = (s: { id: number; name: string; stationCode?: string }): Option => ({
  value: s.id,
  label: s.stationCode ? `${s.stationCode} – ${s.name}` : s.name,
});

const loadOptions = async (inputValue: string): Promise<Option[]> => {
  if (inputValue.trim().length < 2) return [];
  const res = await referenceApi.getStations(inputValue.trim());
  return (res.data as { id: number; name: string; stationCode?: string }[]).map(toOption);
};

interface StationSelectProps {
  value?: number;
  onChange: (id: number | undefined) => void;
}

const sharedStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderColor: state.isFocused ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.25)' : 'none',
    borderRadius: '0.5rem',
    minHeight: '2.5rem',
    '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
  }),
  menu: (base: object) => ({
    ...base,
    backgroundColor: 'rgba(15,23,42,0.97)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
    backdropFilter: 'blur(12px)',
    zIndex: 9999,
  }),
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgba(99,102,241,0.4)'
      : state.isFocused
      ? 'rgba(255,255,255,0.07)'
      : 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.875rem',
  }),
  singleValue: (base: object) => ({ ...base, color: '#e2e8f0' }),
  input: (base: object) => ({ ...base, color: '#e2e8f0' }),
  placeholder: (base: object) => ({ ...base, color: '#64748b' }),
  noOptionsMessage: (base: object) => ({ ...base, color: '#64748b' }),
  loadingMessage: (base: object) => ({ ...base, color: '#64748b' }),
  clearIndicator: (base: object) => ({ ...base, color: '#64748b', '&:hover': { color: '#e2e8f0' } }),
  dropdownIndicator: (base: object) => ({ ...base, color: '#64748b', '&:hover': { color: '#e2e8f0' } }),
  indicatorSeparator: (base: object) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.08)' }),
};

const StationSelect: React.FC<StationSelectProps> = ({ value, onChange }) => {
  // When an existing video is loaded, we need to show its station as the initial value.
  // We store it as a resolved option so react-select can display it.
  const [initialOption, setInitialOption] = React.useState<Option | null>(null);

  React.useEffect(() => {
    if (!value) { setInitialOption(null); return; }
    // Show a temporary label while the user hasn't searched yet;
    // once they open the dropdown and search, the real name will appear.
    if (initialOption && initialOption.value === value) return;
    setInitialOption({ value, label: `Station #${value}` });
  }, [value]);

  const handleChange = (selected: Option | null) => {
    setInitialOption(selected);
    onChange(selected ? selected.value : undefined);
  };

  return (
    <AsyncSelect<Option>
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      value={initialOption}
      onChange={handleChange}
      placeholder="Type 2+ chars to search stations…"
      isClearable
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2 ? 'Type at least 2 characters to search' : 'No stations found'
      }
      loadingMessage={() => 'Searching…'}
      classNamePrefix="react-select"
      styles={sharedStyles as object}
    />
  );
};

export default StationSelect;
