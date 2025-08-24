import { useState, useRef, useEffect } from 'react';

interface CodeInputProps {
  length: number;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

const CodeInput = ({ length, value, onChange, disabled = false }: CodeInputProps) => {
  const [codes, setCodes] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar el valor externo con los inputs internos
  useEffect(() => {
    if (value) {
      const newCodes = value.split('').concat(new Array(length).fill('')).slice(0, length);
      setCodes(newCodes);
    }
  }, [value, length]);

  const handleChange = (index: number, newValue: string) => {
    // Solo permitir números
    if (newValue && !/^\d$/.test(newValue)) return;

    const newCodes = [...codes];
    newCodes[index] = newValue;
    setCodes(newCodes);

    // Notificar el cambio completo
    onChange(newCodes.join(''));

    // Auto-focus al siguiente input si se ingresó un dígito
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Manejar backspace
    if (e.key === 'Backspace') {
      if (!codes[index] && index > 0) {
        // Si el input actual está vacío, ir al anterior
        inputRefs.current[index - 1]?.focus();
      } else {
        // Limpiar el input actual
        const newCodes = [...codes];
        newCodes[index] = '';
        setCodes(newCodes);
        onChange(newCodes.join(''));
      }
    }
    // Manejar flechas de navegación
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newCodes = pastedData.split('').concat(new Array(length).fill('')).slice(0, length);
      setCodes(newCodes);
      onChange(pastedData);
      
      // Focus en el siguiente input vacío o en el último
      const nextEmptyIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  return (
    <div className="d-flex justify-content-center gap-2">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="form-control text-center fw-bold"
          style={{
            width: '50px',
            height: '60px',
            fontSize: '1.5rem',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0d6efd';
            e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#dee2e6';
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;
