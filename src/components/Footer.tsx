import { useFormStore } from '../zustand/formStore';
import { useLocation } from 'react-router-dom';

interface FooterProps {
  showFooter?: boolean;
}

const Footer = ({ showFooter }: FooterProps) => {
  const { form } = useFormStore();
  const bypass = form.bypass;
  const location = useLocation();

  // Revisar si hay parámetro en la URL para ocultar el footer
  const searchParams = new URLSearchParams(location.search);
  const hideFooterParam = searchParams.get('hideFooter') === 'true';

  // Lógica de visibilidad
  // Si el parámetro hideFooter=true está en la URL, ocultar
  if (hideFooterParam) {
    return null;
  }

  // Si bypass = true y showFooter no está definido, por defecto false
  // Si bypass = true y showFooter = true, mostrar
  // Si bypass = false y showFooter = false, no mostrar
  // Si bypass = false y showFooter = true (o no está definido), mostrar
  const shouldShow = bypass 
    ? showFooter === true  // Solo mostrar si explícitamente es true
    : showFooter !== false; // Mostrar a menos que explícitamente sea false

  if (!shouldShow) {
    return null;
  }

  return (
    <footer className="py-3 text-white" style={{ fontFamily: '"Work Sans", sans-serif', backgroundColor: '#000000', marginTop: '4rem' }}>
      <div className="container">
        <div className="row">
          {/* Logo y redes sociales */}
          <div className="col-lg-3 col-md-6 col-12 mb-4">
            <div className="d-flex align-items-center mb-4">
              <img 
                src="https://comunidadsolar.es/wp-content/uploads/2022/12/Logo-CS-25-white.svg"
                alt="Comunidad Solar"
                style={{ height: '40px', width: 'auto' }}
                className="me-3"
              />
            </div>

            {/* Redes sociales */}
            <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center justify-content-md-start">
              <a 
                href="https://www.facebook.com/comunidadsolar2.0" 
                className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://www.youtube.com/channel/UCbTB-HMWNfk8TUz05uuehcw" 
                className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a 
                href="https://www.linkedin.com/company/comunidadsolar?trk=public_post_share-update_actor-image" 
                className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a 
                href="https://www.instagram.com/comunidadsolar/?hl=es" 
                className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>

            {/* Enlaces adicionales */}
            <div className="mb-3 text-center text-md-start">
              <a href="https://comunidadsolar.es/cs-en-los-medios-de-comunicacion/" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                <i className="fas fa-microphone me-2"></i>
                <small>CS en medios de comunicación</small>
              </a>
              <a href="https://comunidadsolar.es/blog" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                <i className="fas fa-blog me-2"></i>
                <small>Blog</small>
              </a>
            </div>
          </div>

          {/* Servicios */}
          <div className="col-lg-3 col-md-6 col-sm-6 col-12 mb-4">
            <h6 className="text-white fw-bold mb-3 text-center text-md-start">Servicios</h6>
            <ul className="list-unstyled text-center text-md-start">
              <li className="mb-2">
                <a href="https://comunidadsolar.es/autoconsumo-remoto/" className="text-white text-decoration-none">
                  <small>Autoconsumo Remoto</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://comunidadsolar.es/comunidad-energetica-de-mi-pueblo" className="text-white text-decoration-none">
                  <small>Comunidades Energéticas</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://comunidadsolar.es/autoconsumo-en-mi-tejado/" className="text-white text-decoration-none">
                  <small>Autoconsumo Individual</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://comunidadsolar.es/anfitrion-solar/" className="text-white text-decoration-none">
                  <small>Anfitrión Solar</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://comunidadsolar.es/tarifas/" className="text-white text-decoration-none">
                  <small>Comercializadora</small>
                </a>
              </li>
            </ul>
          </div>

          {/* Compañía */}
          <div className="col-lg-3 col-md-6 col-sm-6 col-12 mb-4">
            <h6 className="text-white fw-bold mb-3 text-center text-md-start">Compañía</h6>
            <ul className="list-unstyled text-center text-md-start">
              <li className="mb-2">
                <a href="https://comunidadsolar.es/nosotros/" className="text-white text-decoration-none">
                  <small>Sobre nosotros</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://comunidad.zohorecruit.eu/careers" className="text-white text-decoration-none">
                  <small>Trabaja con nosotros</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://ayuda.comunidadsolar.es/portal/es/kb?_gl=1*2frxtc*_ga*MjA5MDI1MDQyOC4xNjcxNjQxMzAz*_up*MQ.." className="text-white text-decoration-none">
                  <small>Centro de ayuda</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://mi.comunidad.solar/tickets" className="text-white text-decoration-none">
                  <small>Soporte</small>
                </a>
              </li>
              <li className="mb-2">
                <a href="https://eventos.comunidadsolar.es/events" className="text-white text-decoration-none">
                  <small>Eventos</small>
                </a>
              </li>
            </ul>
          </div>

          {/* Contacta */}
          <div className="col-lg-3 col-md-6 col-12 mb-4">
            <h6 className="text-white fw-bold mb-3 text-center text-md-start">Contacta</h6>
            <ul className="list-unstyled text-center text-md-start">
              <li className="mb-3">
                <a href="tel:+34900802812" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <i className="fas fa-phone me-2"></i>
                  <small>+34 900 802 812</small>
                </a>
              </li>
              <li className="mb-3">
                <a href="https://wa.me/34611195869" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp me-2"></i>
                  <small>+34 611 195 869</small>
                </a>
              </li>
              <li className="mb-3">
                <a href="mailto:info@comunidad.solar" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <i className="fas fa-envelope me-2"></i>
                  <small>info@comunidad.solar</small>
                </a>
              </li>
              <li className="mb-3">
                <a href="https://comunidadsolar.es/preguntas-frecuentes/" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <i className="fas fa-question-circle me-2"></i>
                  <small>Preguntas frecuentes</small>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <hr className="border-secondary my-4" />

        {/* Copyright y enlaces legales */}
        <div className="row align-items-center">
          <div className="col-md-4 col-12 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0 text-white">
              <small>Copyright © 2025 Comunidad Solar</small>
            </p>
          </div>
          <div className="col-md-8 col-12">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-3 gap-md-4">
              <a href="https://comunidadsolar.es/politica-privacidad/" className="text-decoration-none" style={{ color: '#79BC1C' }} target="_blank" rel="noopener noreferrer">
                <small>Política de Privacidad</small>
              </a>
              <a href="https://comunidadsolar.es/cookies/?_gl=1*6axzbh*_up*MQ..&gclid=Cj0KCQiA5aWOBhDMARIsAIXLlkc_MRKWISNa2-7NsRP7xFkKkuZxNID6v4KF7BWt4FOguHxyBSCPYV0aAmzvEALw_wcB" className="text-decoration-none" style={{ color: '#79BC1C' }}>
                <small>Política de Cookies</small>
              </a>
              <a href="https://comunidadsolar.es/aviso-legal/" className="text-decoration-none" style={{ color: '#79BC1C' }}>
                <small>Aviso legal</small>
              </a>
              <a href="https://comunidadsolar.es/terminos-y-condiciones/" className="text-decoration-none" style={{ color: '#79BC1C' }}>
                <small>Términos y Condiciones</small>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
