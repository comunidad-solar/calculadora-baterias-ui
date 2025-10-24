

import { Routes, Route } from 'react-router-dom';
import HomeSelector from '../components/HomeSelector';
import ComuneroForm from '../components/ComuneroForm';
import ComuneroEmailForm from '../components/ComuneroEmailForm';
import ComuneroCodigoForm from '../components/ComuneroCodigoForm';
import ResultadoValidacion from '../components/ResultadoValidacion';

import PreguntasAdicionales from '../components/PreguntasAdicionales';
import EmailDuplicado from '../components/EmailDuplicado';
import GraciasContacto from '../components/GraciasContacto';
import ClienteViewer from '../components/ClienteViewer';
import FirmaContrato from '../components/FirmaContrato';
import ContratoFirmado from '../components/ContratoFirmado';
import FueraDeZona from '../components/FueraDeZona';
import PagoPago from '../components/PagoPago';
import PagoExitoso from '../components/PagoExitoso';
import PagoExitosoContrataVisita from '../components/PagoExitosoContrataVisita';
import Propuesta from '../components/Propuesta';
// import PagoExitosoPropuestaContrata from '../components/PagoExitosoPropuestaContrata';

const AppRoutes = ({ onSelect }: { onSelect: (isComunero: boolean) => void }) => (
	<Routes>
		<Route path="/" element={
			<div style={{ maxWidth: 700, width: '100%' }}>
				<HomeSelector onSelect={onSelect} />
			</div>
		} />
		<Route path="/comunero" element={<ComuneroEmailForm />} />
		<Route path="/comunero/validar" element={<ComuneroCodigoForm />} />
		<Route path="/comunero/email-duplicado" element={<EmailDuplicado />} />
		<Route path="/resultado" element={<ResultadoValidacion />} />
		<Route path="/propuesta" element={<Propuesta />} />
		<Route path="/preguntas-adicionales" element={<PreguntasAdicionales />} />
		<Route path="/fuera-de-zona" element={<FueraDeZona />} />
		<Route path="/gracias-contacto" element={<GraciasContacto />} />
		<Route path="/comunero/:id" element={<ClienteViewer />} />
		<Route path="/contratacion/firma-contrato" element={<FirmaContrato />} />
		<Route path="/contrato/:propuestaId/firmado" element={<ContratoFirmado />} />
		<Route path="/pago" element={<PagoPago />} />
		<Route path="/pago-exitoso" element={<PagoExitoso />} />
		<Route path="/pago-exitoso/reserva/:propuestaId/type/:type" element={<PagoExitoso />} />
		<Route path="/pago-exitoso/contrata/vt/:propuestaId" element={<PagoExitosoContrataVisita />} />
		{/* <Route path="/pago-exitoso/propuesta/:propuestaId/contrata" element={<PagoExitosoPropuestaContrata />} /> */}
		<Route path="/nuevo-comunero" element={
			<div className="w-100" style={{ maxWidth: 700 }}>
				<ComuneroForm />
			</div>
		} />
	</Routes>
);

export default AppRoutes;
