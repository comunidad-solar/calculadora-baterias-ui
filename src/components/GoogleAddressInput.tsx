import { useState, useCallback } from 'react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import type { PlacePrediction } from '../hooks/useGooglePlaces';

interface GoogleAddressInputProps {
  value: string;
  onChange: (address: string) => void;
}

const GoogleAddressInput: React.FC<GoogleAddressInputProps> = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isLoaded, error: googleError, searchPlaces, getPlaceDetails } = useGooglePlaces();

  // Debounce function para evitar demasiadas llamadas a la API
  const debounce = (func: Function, wait: number) => {
    let timeout: number;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
    };
  };

  const searchAddresses = useCallback(
    debounce(async (query: string) => {
      if (!isLoaded || !query || query.length < 3) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const predictions = await searchPlaces(query, {
          componentRestrictions: { country: 'es' },
          types: ['address', 'establishment']
        });
        setSuggestions(predictions.slice(0, 5)); // Máximo 5 sugerencias
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching places:', err);
        setSuggestions([]);
        // Fallback a sugerencias mock si falla la API
        const mockSuggestions: PlacePrediction[] = [
          {
            place_id: 'mock1',
            description: `${query}, Madrid, España`,
            structured_formatting: {
              main_text: query,
              secondary_text: 'Madrid, España'
            }
          },
          {
            place_id: 'mock2',
            description: `${query}, Barcelona, España`,
            structured_formatting: {
              main_text: query,
              secondary_text: 'Barcelona, España'
            }
          }
        ];
        setSuggestions(mockSuggestions);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 300),
    [isLoaded, searchPlaces]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.length > 2) {
      setLoading(true);
      searchAddresses(val);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (prediction: PlacePrediction) => {
    setLoading(true);
    setShowDropdown(false);
    
    try {
      // Si es una predicción real de Google, obtener detalles
      if (!prediction.place_id.startsWith('mock')) {
        const placeDetails = await getPlaceDetails(prediction.place_id);
        onChange(placeDetails.formatted_address);
      } else {
        // Para sugerencias mock, usar la descripción directamente
        onChange(prediction.description);
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      onChange(prediction.description);
    } finally {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleBlur = () => {
    // Retrasar el cierre para permitir clicks en las sugerencias
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="position-relative">
      <label className="form-label">
        Dirección <span className="text-danger">*</span>
        {googleError && <small className="text-warning ms-1">(Modo sin conexión)</small>}
        {!isLoaded && !googleError && <small className="text-muted ms-1">(Cargando Google Maps...)</small>}
      </label>
      <input
        type="text"
        required
        placeholder="Busca tu dirección..."
        className="form-control form-control-lg"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      
      {loading && (
        <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom p-2" style={{zIndex: 1000}}>
          <div className="text-muted text-center">
            <small>🔍 Buscando direcciones...</small>
          </div>
        </div>
      )}
      
      {showDropdown && suggestions.length > 0 && !loading && (
        <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm" style={{zIndex: 1000}}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="px-3 py-2 border-bottom cursor-pointer d-flex align-items-start"
              style={{cursor: 'pointer'}}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="me-2 mt-1">📍</span>
              <div>
                <div className="fw-semibold">{suggestion.structured_formatting.main_text}</div>
                <small className="text-muted">{suggestion.structured_formatting.secondary_text}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleAddressInput;
