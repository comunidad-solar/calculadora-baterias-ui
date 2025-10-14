import { useFormStore } from '../zustand/formStore';
import { useAsesores } from '../hooks/useAsesores';

interface HeaderProps {
  showHeader?: boolean;
}

const Header = ({ showHeader }: HeaderProps) => {
  const { form } = useFormStore();
  const bypass = form.bypass;
  const { isAsesores } = useAsesores();

  // Lógica de visibilidad - misma que Footer
  // Si bypass = true y showHeader no está definido, por defecto false
  // Si bypass = true y showHeader = true, mostrar
  // Si bypass = false y showHeader = false, no mostrar
  // Si bypass = false y showHeader = true (o no está definido), mostrar
  const shouldShow = bypass 
    ? showHeader === true  // Solo mostrar si explícitamente es true
    : showHeader !== false; // Mostrar a menos que explícitamente sea false

  if (!shouldShow) {
    return null;
  }

  return (
    <header className="py-3 text-dark" style={{ fontFamily: '"Work Sans", sans-serif', backgroundColor: '#ffffff' }}>
      <div className="container-fluid px-3">
        {/* Desktop Layout */}
        <div className="d-none d-lg-block">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-auto">
              <div className="d-flex align-items-center">
                <img 
                  src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-3-3.svg"
                  alt="Comunidad Solar"
                  style={{ height: '50px', width: 'auto' }}
                  className="me-5"
                />
              </div>
            </div>

            {/* Contador de comuneros */}
            <div className="col-auto">
              <div className="d-flex align-items-center text-dark me-5">
                {isAsesores && (
                  <span className="badge bg-warning text-dark me-2" style={{ fontSize: '1.1rem' }}>
                    WEB PRIVADA DE ASESORES
                  </span>
                )}
                <img 
                  src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-18.png"
                  alt="Comuneros"
                  style={{ height: '18px', width: '18px' }}
                  className="me-2"
                />
                <span className="fw-semibold" style={{ fontSize: '15px' }}>3.375 comuneros</span>
              </div>
            </div>

            {/* Navegación principal */}
            <div className="col d-flex justify-content-center">
              <nav className="d-flex align-items-center" style={{ gap: '2.5rem' }}>
                <a href="https://comunidadsolar.es/nosotros/" className="text-dark text-decoration-none d-flex align-items-center">
                  <img 
                    src="https://comunidadsolar.es/wp-content/uploads/2022/12/flag-1.svg"
                    alt="Misión"
                    style={{ height: '18px', width: '18px' }}
                    className="me-2"
                  />
                  <span className="fw-semibold" style={{ fontSize: '17px' }}>Misión</span>
                </a>
                
                <div className="dropdown">
                  <a 
                    href="#" 
                    className="text-dark text-decoration-none dropdown-toggle d-flex align-items-center"
                    id="solucionesDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img 
                      src="https://comunidadsolar.es/wp-content/uploads/2023/07/solar-panel-iconv2.svg"
                      alt="Soluciones"
                      style={{ height: '18px', width: '18px' }}
                      className="me-2"
                    />
                    <span className="fw-semibold" style={{ fontSize: '17px' }}>Soluciones</span>
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="solucionesDropdown">
                    <li>
                      <a className="dropdown-item" href="https://comunidadsolar.es/autoconsumo-remoto/">
                        Autoconsumo Remoto
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://comunidadsolar.es/comunidad-energetica-de-mi-pueblo">
                        Comunidades Energéticas
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://comunidadsolar.es/autoconsumo-en-mi-tejado/">
                        Autoconsumo Individual
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://comunidadsolar.es/anfitrion-solar/">
                        Anfitrión Solar
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://comunidadsolar.es/tarifas/">
                        Comercializadora
                      </a>
                    </li>
                  </ul>
                </div>
                
                <a href="https://comunidadsolar.es/nosotros/" className="text-dark text-decoration-none d-flex align-items-center">
                  <img 
                    src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-3-1.svg"
                    alt="Nosotros"
                    style={{ height: '18px', width: '18px' }}
                    className="me-2"
                  />
                  <span className="fw-semibold" style={{ fontSize: '17px' }}>Nosotros</span>
                </a>
                
                <a 
                  href="https://comunidadsolar.es/contacto/" 
                  className="text-dark text-decoration-none d-flex align-items-center"
                >
                  <img 
                    src="https://comunidadsolar.es/wp-content/uploads/2022/12/support.svg"
                    alt="Contacto"
                    style={{ height: '18px', width: '18px' }}
                    className="me-2"
                  />
                  <span className="fw-semibold" style={{ fontSize: '17px' }}>Contacto</span>
                </a>
              </nav>
            </div>

            {/* Avatar del usuario */}
            <div className="col-auto ms-2 me-5">
              <img 
                src="https://comunidadsolar.es/wp-content/uploads/2022/12/user.svg"
                alt="Usuario"
                style={{ height: '24px', width: '24px' }}
                className="rounded-circle"
              />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="d-lg-none">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-auto">
              <img 
                src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-3-3.svg"
                alt="Comunidad Solar"
                style={{ height: '40px', width: 'auto' }}
              />
            </div>
            
            {/* Contador de comuneros - Solo en tablet */}
            <div className="col-auto d-none d-md-block">
              <div className="d-flex align-items-center text-dark me-3">
                <img 
                  src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-18.png"
                  alt="Comuneros"
                  style={{ height: '16px', width: '16px' }}
                  className="me-2"
                />
                <span className="fw-semibold" style={{ fontSize: '14px' }}>3.375 comuneros</span>
              </div>
            </div>

            {/* Spacer para empujar elementos a la derecha */}
            <div className="col"></div>

            {/* Avatar */}
            <div className="col-auto me-2">
              <img 
                src="https://comunidadsolar.es/wp-content/uploads/2022/12/user.svg"
                alt="Usuario"
                style={{ height: '24px', width: '24px' }}
                className="rounded-circle"
              />
            </div>

            {/* Menú hamburguesa */}
            <div className="col-auto">
              <button 
                className="btn btn-outline-dark btn-sm"
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#mobileMenu" 
                aria-controls="mobileMenu" 
                aria-expanded="false" 
                aria-label="Toggle navigation"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>

          {/* Menú móvil colapsable */}
          <div className="collapse mt-3" id="mobileMenu">
            <div className="row">
              {/* Contador de comuneros - Solo móvil */}
              <div className="col-12 d-md-none mb-3">
                <div className="d-flex align-items-center text-dark justify-content-center">
                  <img 
                    src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-18.png"
                    alt="Comuneros"
                    style={{ height: '16px', width: '16px' }}
                    className="me-2"
                  />
                  <span className="fw-semibold" style={{ fontSize: '14px' }}>3.375 comuneros</span>
                </div>
              </div>

              {/* Navegación móvil */}
              <div className="col-12">
                <nav className="d-flex flex-column align-items-center gap-3">
                  <a href="https://comunidadsolar.es/nosotros/" className="text-dark text-decoration-none d-flex align-items-center">
                    <img 
                      src="https://comunidadsolar.es/wp-content/uploads/2022/12/flag-1.svg"
                      alt="Misión"
                      style={{ height: '16px', width: '16px' }}
                      className="me-2"
                    />
                    <span className="fw-semibold">Misión</span>
                  </a>
                  
                  <div className="dropdown">
                    <a 
                      href="#" 
                      className="text-dark text-decoration-none dropdown-toggle d-flex align-items-center"
                      id="solucionesDropdownMobile"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <img 
                        src="https://comunidadsolar.es/wp-content/uploads/2023/07/solar-panel-iconv2.svg"
                        alt="Soluciones"
                        style={{ height: '16px', width: '16px' }}
                        className="me-2"
                      />
                      <span className="fw-semibold">Soluciones</span>
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="solucionesDropdownMobile">
                      <li>
                        <a className="dropdown-item" href="https://comunidadsolar.es/autoconsumo-remoto/">
                          Autoconsumo Remoto
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="https://comunidadsolar.es/comunidad-energetica-de-mi-pueblo">
                          Comunidades Energéticas
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="https://comunidadsolar.es/autoconsumo-en-mi-tejado/">
                          Autoconsumo Individual
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="https://comunidadsolar.es/anfitrion-solar/">
                          Anfitrión Solar
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="https://comunidadsolar.es/tarifas/">
                          Comercializadora
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <a href="https://comunidadsolar.es/nosotros/" className="text-dark text-decoration-none d-flex align-items-center">
                    <img 
                      src="https://comunidadsolar.es/wp-content/uploads/2023/07/Recurso-3-1.svg"
                      alt="Nosotros"
                      style={{ height: '16px', width: '16px' }}
                      className="me-2"
                    />
                    <span className="fw-semibold">Nosotros</span>
                  </a>
                  
                  <a 
                    href="https://comunidadsolar.es/contacto/" 
                    className="text-dark text-decoration-none d-flex align-items-center"
                  >
                    <img 
                      src="https://comunidadsolar.es/wp-content/uploads/2022/12/support.svg"
                      alt="Contacto"
                      style={{ height: '16px', width: '16px' }}
                      className="me-2"
                    />
                    <span className="fw-semibold">Contacto</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
