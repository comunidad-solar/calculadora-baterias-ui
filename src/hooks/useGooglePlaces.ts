import { useState, useEffect, useRef } from 'react';

// Declarar tipos globales para Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const useGooglePlaces = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
      setError('API Key de Google Maps no configurada');
      return;
    }

    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      initializeServices();
      return;
    }

    // Función de callback global
    window.initGoogleMaps = () => {
      initializeServices();
    };

    // Cargar el script de Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      setError('Error al cargar Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Limpiar el script al desmontar
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
      (window as any).initGoogleMaps = undefined;
    };
  }, []);

  const initializeServices = () => {
    try {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      setError('Error al inicializar servicios de Google Places');
    }
  };

  const searchPlaces = async (
    query: string,
    options: {
      componentRestrictions?: { country: string };
      types?: string[];
    } = {}
  ): Promise<PlacePrediction[]> => {
    
    return new Promise((resolve, reject) => {
      if (!isLoaded || !autocompleteService.current) {
        reject(new Error('Google Places no está disponible'));
        return;
      }

      // Validar tipos - no mezclar 'address' con otros tipos
      let validTypes = options.types || ['address'];
      if (validTypes.includes('address') && validTypes.length > 1) {
        console.warn('Google Places: No se puede mezclar "address" con otros tipos. Usando solo "address".');
        validTypes = ['address'];
      }

      const defaultOptions = {
        input: query,
        componentRestrictions: { country: 'es' }, // Restringir a España
        types: validTypes, // Usar los tipos validados
        ...options,
      };
      
      // Sobrescribir tipos para asegurar que se usen los validados
      defaultOptions.types = validTypes;

      autocompleteService.current.getPlacePredictions(
        defaultOptions,
        (predictions: PlacePrediction[] | null, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Si no hay resultados con 'address', intentar con geocode como fallback
            if (validTypes.includes('address')) {
              const fallbackOptions = {
                ...defaultOptions,
                types: ['geocode'] // Fallback a geocode si address no da resultados
              };
              
              autocompleteService.current.getPlacePredictions(
                fallbackOptions,
                (fallbackPredictions: PlacePrediction[] | null, fallbackStatus: any) => {
                  if (fallbackStatus === window.google.maps.places.PlacesServiceStatus.OK && fallbackPredictions) {
                    resolve(fallbackPredictions);
                  } else {
                    resolve([]);
                  }
                }
              );
            } else {
              resolve([]);
            }
          } else {
            console.error('Google Places API Status:', status);
            reject(new Error('Error en la búsqueda de lugares'));
          }
        }
      );
    });
  };

  const getPlaceDetails = async (placeId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!isLoaded || !placesService.current) {
        reject(new Error('Google Places no está disponible'));
        return;
      }

      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error('Error al obtener detalles del lugar'));
          }
        }
      );
    });
  };

  return {
    isLoaded,
    error,
    searchPlaces,
    getPlaceDetails,
  };
};
