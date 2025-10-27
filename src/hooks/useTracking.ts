import { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import { trackEvent } from "../utils/trackUserActivity";
import ReactGA from "react-ga4";


const TRACKING_ID = "G-EE5NXKDT7G"; 
let isInitialized = false;

const useTracking = (): void => {
    const location = useLocation();
  
     useEffect(() => {
    if (!isInitialized) {
      ReactGA.initialize(TRACKING_ID);
      isInitialized = true;
    }

    // Envía el evento de vista de página cada vez que la URL cambia
    ReactGA.send({ hitType: "pageview", page: location.pathname });

  }, [location]);

};

export default useTracking;