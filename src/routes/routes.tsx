

import { Routes, Route } from 'react-router-dom';
import HomeSelector from '../components/HomeSelector';
import ComuneroForm from '../components/ComuneroForm';
import ComuneroEmailForm from '../components/ComuneroEmailForm';
import ComuneroCodigoForm from '../components/ComuneroCodigoForm';
import ResultadoValidacion from '../components/ResultadoValidacion';
import Propuesta from '../components/Propuesta';
import PreguntasAdicionales from '../components/PreguntasAdicionales';
import EmailDuplicado from '../components/EmailDuplicado';
import BackButton from '../components/BackButton';

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
		<Route path="/nuevo-comunero" element={
			<div className="w-100" style={{ maxWidth: 700 }}>
				<BackButton />
				<ComuneroForm />
			</div>
		} />
	</Routes>
);

export default AppRoutes;
