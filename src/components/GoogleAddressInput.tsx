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
  
  // LOG: Verificar props iniciales
  // console.log('🏠 GoogleAddressInput - Props recibidas:', {
  //   value,
  //   hasOnChange: !!onChange,
  //   hasOnPostalCodeChange: !!onPostalCodeChange,
  //   hasOnCityChange: !!onCityChange,
  //   hasOnProvinceChange: !!onProvinceChange,
  //   hasOnCountryChange: !!onCountryChange
  // });
  const [isValidAddress, setIsValidAddress] = useState(false); // Nueva state para trackear si la dirección es válida
  const [searchQuery, setSearchQuery] = useState(''); // Query de búsqueda separada del valor seleccionado
  const [isSelecting, setIsSelecting] = useState(false); // Prevenir múltiples selecciones
  const { isLoaded, error: googleError, searchPlaces, getPlaceDetails } = useGooglePlaces();
  
  // LOG: Estado del hook Google Places
  // console.log('🗺️ useGooglePlaces estado:', {
  //   isLoaded,
  //   googleError,
  //   hasSearchPlaces: !!searchPlaces,
  //   hasGetPlaceDetails: !!getPlaceDetails,
  //   browserInfo: {
  //     userAgent: navigator.userAgent,
  //     platform: navigator.platform,
  //     vendor: navigator.vendor
  //   }
  // });

  // LOG: Información del entorno al montar el componente
  // useEffect(() => {
  //   console.log('🔍 GoogleAddressInput montado:', {
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent.substring(0, 50) + '...',
  //     hasGoogle: !!window.google,
  //     hasGoogleMaps: !!(window.google && window.google.maps)
  //   });
  // }, []);

  // Sincronizar con cambios externos del valor (ej: reset del formulario)
  useEffect(() => {
    // console.log('🔄 Value cambió externamente:', { newValue: value });
    if (!value) {
      setIsValidAddress(false);
      setSearchQuery('');
    }
  }, [value]); // Removed searchQuery from dependencies to avoid infinite loop

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
    try {
      const val = e.target.value;
      
      // console.log('⌨️ Input change:', {
      //   newValue: val,
      //   currentValue: value,
      //   searchQuery,
      //   isValidAddress,
      //   timestamp: new Date().toISOString()
      // });
      
      // Si ya hay una dirección válida seleccionada y el usuario está escribiendo,
      // limpiar la dirección válida y comenzar una nueva búsqueda
      if (isValidAddress && val !== value) {
        // console.log('🔄 Limpiando dirección válida para nueva búsqueda');
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
    } catch (error) {
      console.error('❌ Error en handleInputChange:', error);
      // Fallback: al menos permitir que se actualice el searchQuery
      const val = e.target.value;
      setSearchQuery(val);
    }
  };

  const handleSelectSuggestion = async (prediction: PlacePrediction) => {
    if (isSelecting) {
      // console.log('⏳ Ya hay una selección en proceso, ignorando...');
      return;
    }
    
    // console.log('🔍 Seleccionando sugerencia:', prediction);
    setIsSelecting(true);
    setLoading(true);
    setShowDropdown(false);
    try {
      // Si es una predicción real de Google, obtener detalles
      if (!prediction.place_id.startsWith('mock')) {
        // console.log('🔍 Obteniendo detalles del lugar:', prediction.place_id);
        const placeDetails = await getPlaceDetails(prediction.place_id);
        // console.log('📋 Detalles obtenidos:', placeDetails);
        
        // Extraer todos los componentes de dirección si están disponibles
        const addressComponents = placeDetails.address_components || [];
        const postalCode = extractPostalCode(addressComponents);
        const city = extractCity(addressComponents);
        const province = extractProvince(addressComponents);
        const country = extractCountry(addressComponents);
        
        // Actualizar dirección y marcar como válida
        // console.log('✅ Actualizando dirección con:', placeDetails.formatted_address);
        
        // LOG: Verificar función onChange antes de llamarla
        // console.log('🔧 Verificando onChange:', {
        //   hasOnChange: !!onChange,
        //   onChangeType: typeof onChange,
        //   onChangeName: onChange?.name
        // });
        
        onChange(placeDetails.formatted_address);
    
        setIsValidAddress(true);
        setSearchQuery(placeDetails.formatted_address);
        
        // console.log('✅ Estados actualizados:', {
        //   isValidAddress: true,
        //   searchQuery: placeDetails.formatted_address,
        //   timestamp: new Date().toISOString(),
        //   success: true
        // });
        
        // SIEMPRE ejecutar todos los callbacks para resetear completamente la información de dirección
        // Esto evita que se mantengan valores antiguos de direcciones previas
        
        if (onPostalCodeChange) {
          const finalPostalCode = postalCode || ''; // Usar string vacío si no hay código postal
          // console.log('📍 Ejecutando onPostalCodeChange con:', finalPostalCode);
          try {
            onPostalCodeChange(finalPostalCode);
            // console.log('✅ onPostalCodeChange ejecutado exitosamente');
          } catch (err) {
            console.error('❌ Error en onPostalCodeChange:', err);
          }
        }
        
        if (onCityChange) {
          const finalCity = city || ''; // Usar string vacío si no hay ciudad
          // console.log('🏙️ Ejecutando onCityChange con:', finalCity);
          try {
            onCityChange(finalCity);
            // console.log('✅ onCityChange ejecutado exitosamente');
          } catch (err) {
            console.error('❌ Error en onCityChange:', err);
          }
        }
        
        if (onProvinceChange) {
          const finalProvince = province || ''; // Usar string vacío si no hay provincia
          // console.log('🗺️ Ejecutando onProvinceChange con:', finalProvince);
          try {
            onProvinceChange(finalProvince);
            // console.log('✅ onProvinceChange ejecutado exitosamente');
          } catch (err) {
            console.error('❌ Error en onProvinceChange:', err);
          }
        }
        
        if (onCountryChange) {
          const finalCountry = country || ''; // Usar string vacío si no hay país
          // console.log('🌍 Ejecutando onCountryChange con:', finalCountry);
          try {
            onCountryChange(finalCountry);
            // console.log('✅ onCountryChange ejecutado exitosamente');
          } catch (err) {
            console.error('❌ Error en onCountryChange:', err);
          }
        }
        
        // Log completo para debugging
        // console.log('📍 Componentes de dirección extraídos:', {
        //   postalCode,
        //   city,
        //   province,
        //   country,
        //   fullAddress: placeDetails.formatted_address
        // });
        
      } else {
        // Para sugerencias mock, usar la descripción directamente
        // console.log('🎭 Usando sugerencia mock:', prediction.description);
        // console.log('🔧 Verificando onChange para mock:', {
        //   hasOnChange: !!onChange,
        //   onChangeType: typeof onChange
        // });
        
        try {
          onChange(prediction.description);
          setIsValidAddress(true);
          setSearchQuery(prediction.description);
          // console.log('✅ Sugerencia mock procesada exitosamente');
        } catch (err) {
          console.error('❌ Error procesando sugerencia mock:', err);
        }
      }
    } catch (err) {
      console.error('❌ Error obteniendo detalles del lugar:', err);
      // console.log('📋 Usando descripción como fallback:', prediction.description);
      onChange(prediction.description);
      setIsValidAddress(true);
      setSearchQuery(prediction.description);
    } finally {
      setSuggestions([]);
      setLoading(false);
      setIsSelecting(false);
    }
  };

  const handleBlur = () => {
    // console.log('👁️ handleBlur ejecutado:', {
    //   isSelecting,
    //   showDropdown,
    //   suggestions: suggestions.length,
    //   timestamp: new Date().toISOString(),
    //   performance: {
    //     now: performance.now(),
    //     timeOrigin: performance.timeOrigin
    //   }
    // });
    
    // No cerrar si hay una selección en proceso
    if (isSelecting) {
      // console.log('⏳ Selección en proceso, no cerrando dropdown');
      return;
    }
    
    // Retrasar el cierre para permitir clicks en las sugerencias
    // console.log('⏰ Programando cierre del dropdown en 300ms');
    setTimeout(() => {
      // console.log('⏰ Ejecutando cierre del dropdown:', {
      //   isSelecting,
      //   timestamp: new Date().toISOString()
      // });
      if (!isSelecting) {
        setShowDropdown(false);
      }
    }, 300); // Aumentado de 150 a 300ms
  };

  const handleFocus = () => {
    // console.log('👁️ handleFocus ejecutado:', {
    //   isValidAddress,
    //   value,
    //   searchQuery,
    //   suggestionsLength: suggestions.length,
    //   timestamp: new Date().toISOString()
    // });
    
    try {
      // Si ya hay una dirección válida, permitir edición desde cero
      if (isValidAddress) {
        // console.log('🔄 Limpiando dirección válida en focus');
        setIsValidAddress(false);
        setSearchQuery(value);
        // Remover onChange('') que puede estar causando problemas
        // onChange('');
      }
      
      if (suggestions.length > 0) {
        // console.log('📋 Mostrando dropdown existente');
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('❌ Error en handleFocus:', error);
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
        onChange={(e) => {
          // console.log('⌨️ Input onChange raw:', e.target.value);
          handleInputChange(e);
        }}
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
              onMouseDown={(e) => {
                // console.log('🖱️ MouseDown detectado:', {
                //   suggestion: suggestion.description,
                //   eventType: e.type,
                //   button: e.button,
                //   timestamp: new Date().toISOString(),
                //   isSelecting,
                //   showDropdown
                // });
                e.preventDefault(); // Prevenir que onBlur se ejecute
              }}
              onClick={(e) => {
                // console.log('🖱️ Click detectado:', {
                //   suggestion: suggestion.description,
                //   eventType: e.type,
                //   button: e.button,
                //   timestamp: new Date().toISOString(),
                //   isSelecting,
                //   showDropdown,
                //   target: e.target,
                //   currentTarget: e.currentTarget
                // });
                e.preventDefault();
                e.stopPropagation();
                handleSelectSuggestion(suggestion);
              }}
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
