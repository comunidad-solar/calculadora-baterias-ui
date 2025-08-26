interface HomeSelectorProps {
  onSelect: (isComunero: boolean) => void;
}

const HomeSelector: React.FC<HomeSelectorProps> = ({ onSelect }) => {
  return (
  <div className="bg-white rounded-4 px-4 py-5 shadow-lg border w-100 mx-auto" >
      <h1 className="h3 text-center mb-3" style={{fontWeight: '600'}}>
        Calculadora de ahorro y número<br />de paneles solares
      </h1>
      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-dark btn-lg fw-bold px-4 rounded-pill"
          onClick={() => onSelect(true)}
        >
          Soy Comunero
        </button>
        <button
          className="btn btn-outline-dark btn-lg fw-bold px-4 rounded-pill"
          onClick={() => onSelect(false)}
        >
          No soy Comunero
        </button>
      </div>
    </div>
  );
};

export default HomeSelector;
