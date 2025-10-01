import { useState, useCallback, useEffect } from 'react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import type { PlacePrediction } from '../hooks/useGooglePlaces';

interface GoogleAddressInputProps {
  value: string;
  onChange: (address: string) => void;
  onPostalCodeChange?: (postalCode: string) => void; // Nuevo callback para código postal
  onCityChange?: (city: string) => void; // Nuevo callback para ciudad
  onProvinceChange?: (province: string) => void; // Nuevo callback para provincia
  onCountryChange?: (country: string) => void; // Nuevo callback para país
}

const GoogleAddressInput: React.FC<GoogleAddressInputProps> = ({ 
  value, 
  onChange, 
  onPostalCodeChange, 
  onCityChange, 
  onProvinceChange, 
  onCountryChange 
}) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false); // Nueva state para trackear si la dirección es válida
  const [searchQuery, setSearchQuery] = useState(''); // Query de búsqueda separada del valor seleccionado
  const { isLoaded, error: googleError, searchPlaces, getPlaceDetails } = useGooglePlaces();

  // Sincronizar con cambios externos del valor (ej: reset del formulario)
  useEffect(() => {
    if (!value) {
      setIsValidAddress(false);
      setSearchQuery('');
    }
  }, [value]);

  // Función helper para extraer código postal de address_components
  const extractPostalCode = (addressComponents: any[]): string | null => {
    if (!addressComponents) return null;
    
    const postalCodeComponent = addressComponents.find(component => 
      component.types.includes('postal_code')
    );
    
    return postalCodeComponent ? postalCodeComponent.long_name : null;
  };

  // Función helper para extraer ciudad de address_components
  const extractCity = (addressComponents: any[]): string | null => {
    if (!addressComponents) return null;
    
    // Buscar por diferentes tipos de ciudad/localidad
    const cityComponent = addressComponents.find(component => 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_2') ||
      component.types.includes('sublocality')
    );
    
    return cityComponent ? cityComponent.long_name : null;
  };

  // Función helper para extraer provincia de address_components
  const extractProvince = (addressComponents: any[]): string | null => {
    if (!addressComponents) return null;
    
    const provinceComponent = addressComponents.find(component => 
      component.types.includes('administrative_area_level_1')
    );
    
    return provinceComponent ? provinceComponent.long_name : null;
  };

  // Función helper para extraer país de address_components
  const extractCountry = (addressComponents: any[]): string | null => {
    if (!addressComponents) return null;
    
    const countryComponent = addressComponents.find(component => 
      component.types.includes('country')
    );
    
    return countryComponent ? countryComponent.long_name : null;
  };

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
        setShowDropdown(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const predictions = await searchPlaces(query, {
          componentRestrictions: { country: 'es' },
          types: ['address'] // Solo direcciones para evitar el error de mezcla de tipos
        });
        setSuggestions(predictions.slice(0, 5)); // Máximo 5 sugerencias
        setShowDropdown(predictions.length > 0);
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
        setShowDropdown(mockSuggestions.length > 0);
      } finally {
        setLoading(false);
      }
    }, 300),
    [isLoaded, searchPlaces]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Si ya hay una dirección válida seleccionada y el usuario está escribiendo,
    // limpiar la dirección válida y comenzar una nueva búsqueda
    if (isValidAddress && val !== value) {
      setIsValidAddress(false);
      onChange(''); // Limpiar la dirección válida
    }
    
    setSearchQuery(val);
    
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
    console.log('🏷️ Sugerencia seleccionada:', prediction);
    try {
      // Si es una predicción real de Google, obtener detalles
      if (!prediction.place_id.startsWith('mock')) {
        const placeDetails = await getPlaceDetails(prediction.place_id);
        console.log('📍 Detalles del lugar obtenidos:', placeDetails);
        // Extraer todos los componentes de dirección si están disponibles
        const addressComponents = placeDetails.address_components || [];
        const postalCode = extractPostalCode(addressComponents);
        const city = extractCity(addressComponents);
        const province = extractProvince(addressComponents);
        const country = extractCountry(addressComponents);
        console.log('🏷️ Componentes extraídos:', { postalCode, city, province, country });
        // Actualizar dirección y marcar como válida
        onChange(placeDetails.formatted_address);
        console.log('📍 Dirección formateada:', placeDetails.formatted_address);
        setIsValidAddress(true);
        setSearchQuery(placeDetails.formatted_address);
        
        // Actualizar cada componente si se proporcionó el callback correspondiente y se encontró el valor
        if (onPostalCodeChange && postalCode) {
          onPostalCodeChange(postalCode);
          console.log('📍 Código postal extraído:', postalCode);
        }
        
        if (onCityChange && city) {
          onCityChange(city);
          console.log('🏙️ Ciudad extraída:', city);
        }
        
        if (onProvinceChange && province) {
          onProvinceChange(province);
          console.log('🗺️ Provincia extraída:', province);
        }
        
        if (onCountryChange && country) {
          onCountryChange(country);
          console.log('🌍 País extraído:', country);
        }
        
        // Log completo para debugging
        console.log('📍 Componentes de dirección extraídos:', {
          postalCode,
          city,
          province,
          country,
          fullAddress: placeDetails.formatted_address
        });
        
      } else {
        // Para sugerencias mock, usar la descripción directamente
        onChange(prediction.description);
        setIsValidAddress(true);
        setSearchQuery(prediction.description);
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      onChange(prediction.description);
      setIsValidAddress(true);
      setSearchQuery(prediction.description);
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
    // Si ya hay una dirección válida, permitir edición desde cero
    if (isValidAddress) {
      setIsValidAddress(false);
      setSearchQuery(value);
      onChange('');
    }
    
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="position-relative">
      <label className="form-label">
        Dirección <span className="text-danger">*</span>
        <small className="text-muted ms-1">(Selecciona de las sugerencias)</small>
        {googleError && <small className="text-warning ms-1">(Modo sin conexión)</small>}
        {!isLoaded && !googleError && <small className="text-muted ms-1">(Cargando Google Maps...)</small>}
      </label>
      <input
        type="text"
        required
        placeholder={isValidAddress ? "Haz clic para cambiar dirección..." : "Busca tu dirección..."}
        className={`form-control form-control-lg ${isValidAddress ? 'is-valid' : (searchQuery && !isValidAddress ? 'is-invalid' : '')}`}
        value={isValidAddress ? value : searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      
      {searchQuery && !isValidAddress && (
        <div className="invalid-feedback">
          Debes seleccionar una dirección de la lista de sugerencias
        </div>
      )}
      
      {isValidAddress && (
        <div className="valid-feedback">
          ✓ Dirección válida seleccionada
        </div>
      )}
      
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
