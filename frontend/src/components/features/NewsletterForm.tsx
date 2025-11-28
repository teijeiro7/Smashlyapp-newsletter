import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getApiUrl, API_CONFIG } from '../../config/api';

interface NewsletterFormProps {
  variant?: 'hero' | 'footer';
  onSuccess?: () => void;
}

const FormContainer = styled(motion.form)<{ variant: 'hero' | 'footer' }>`
  display: flex;
  flex-direction: column;
  gap: ${props => (props.variant === 'hero' ? '1rem' : '0.75rem')};
  width: 100%;
  max-width: ${props => (props.variant === 'hero' ? '500px' : '400px')};
`;

const InputGroup = styled.div<{ variant: 'hero' | 'footer' }>`
  position: relative;
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  
  @media (max-width: 640px) {
    flex-direction: ${props => (props.variant === 'hero' ? 'column' : 'row')};
  }
`;

const EmailInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const EmailInput = styled.input<{ variant: 'hero' | 'footer' }>`
  flex: 1;
  width: 100%;
  padding: ${props => (props.variant === 'hero' ? '1.125rem 1.25rem 1.125rem 3.25rem' : '0.875rem 1rem 0.875rem 2.75rem')};
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: ${props => (props.variant === 'hero' ? '1rem' : '0.875rem')};
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: inherit;

  &:hover {
    border-color: #16a34a;
    box-shadow: 0 2px 6px rgba(22, 163, 74, 0.08);
  }

  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1), 0 2px 8px rgba(22, 163, 74, 0.15);
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const IconWrapper = styled.div<{ variant: 'hero' | 'footer' }>`
  position: absolute;
  left: ${props => (props.variant === 'hero' ? '1.125rem' : '0.875rem')};
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubmitButton = styled(motion.button)<{ variant: 'hero' | 'footer' }>`
  padding: ${props => (props.variant === 'hero' ? '1.125rem 2.5rem' : '0.875rem 1.5rem')};
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: ${props => (props.variant === 'hero' ? '1rem' : '0.875rem')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25);
  letter-spacing: 0.01em;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
    background: linear-gradient(135deg, #15803d 0%, #14532d 100%);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    width: ${props => (props.variant === 'hero' ? '100%' : 'auto')};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;

  input[type='checkbox'] {
    margin-top: 0.25rem;
    cursor: pointer;
  }

  a {
    color: #16a34a;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #16a34a;
  border-radius: 12px;
  color: #15803d;
  font-weight: 500;
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
`;

const NewsletterForm: React.FC<NewsletterFormProps> = ({ variant = 'hero', onSuccess }) => {
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Suscribiendo...');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔵 [Newsletter] Form submitted');
    console.log('📧 [Newsletter] Email:', email);

    // Validations
    if (!email) {
      console.log('❌ [Newsletter] Validation failed: No email');
      setError('Por favor, introduce tu email');
      return;
    }

    if (!validateEmail(email)) {
      console.log('❌ [Newsletter] Validation failed: Invalid email format');
      setError('Por favor, introduce un email válido');
      return;
    }

    if (!accepted) {
      console.log('❌ [Newsletter] Validation failed: Privacy policy not accepted');
      setError('Debes aceptar la política de privacidad');
      return;
    }

    console.log('✅ [Newsletter] All validations passed');

    setLoading(true);
    setLoadingMessage('Conectando con el servidor...');

    const apiUrl = getApiUrl(API_CONFIG.endpoints.newsletter.subscribe);
    console.log('🌐 [Newsletter] API URL:', apiUrl);
    console.log('🌐 [Newsletter] Full endpoint:', API_CONFIG.endpoints.newsletter.subscribe);
    console.log('🌐 [Newsletter] Base URL:', API_CONFIG.baseURL);

    // Show "waking up" message after 5 seconds
    const slowConnectionTimeout = setTimeout(() => {
      console.log('⏰ [Newsletter] 5 seconds elapsed - showing "waking up" message');
      setLoadingMessage('El servidor está despertando, esto puede tardar un momento...');
    }, 5000);

    const startTime = Date.now();

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏱️ [Newsletter] 90 second timeout reached - aborting request');
        controller.abort();
      }, 90000); // 90 seconds timeout

      console.log('📤 [Newsletter] Sending POST request...');
      console.log('📤 [Newsletter] Request body:', JSON.stringify({ email }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ [Newsletter] Request completed in ${duration}ms`);

      clearTimeout(timeoutId);
      clearTimeout(slowConnectionTimeout);

      console.log('📥 [Newsletter] Response status:', response.status);
      console.log('📥 [Newsletter] Response ok:', response.ok);
      console.log('📥 [Newsletter] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const data = await response.json();
        console.log('❌ [Newsletter] Response not OK. Data:', data);
        throw new Error(data.message || 'Error al suscribirse');
      }

      const responseData = await response.json();
      console.log('✅ [Newsletter] Success! Response data:', responseData);

      setSuccess(true);
      setEmail('');
      setAccepted(false);
      toast.success('¡Suscripción exitosa! Revisa tu email.');
      
      if (onSuccess) {
        console.log('🎉 [Newsletter] Calling onSuccess callback');
        onSuccess();
      }
    } catch (err: any) {
      clearTimeout(slowConnectionTimeout);
      
      const duration = Date.now() - startTime;
      console.log(`❌ [Newsletter] Error after ${duration}ms`);
      console.error('❌ [Newsletter] Error details:', err);
      console.error('❌ [Newsletter] Error name:', err.name);
      console.error('❌ [Newsletter] Error message:', err.message);
      console.error('❌ [Newsletter] Error stack:', err.stack);
      
      if (err.name === 'AbortError') {
        console.log('⏱️ [Newsletter] Request aborted due to timeout');
        setError('La conexión tardó demasiado. Por favor, intenta de nuevo en unos segundos.');
        toast.error('Timeout - Intenta de nuevo');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        console.log('🌐 [Newsletter] Network error - possibly CORS or network issue');
        setError('Error de conexión. Verifica tu conexión a internet o intenta más tarde.');
        toast.error('Error de conexión');
      } else {
        console.log('❌ [Newsletter] Other error type');
        setError(err.message || 'Error al suscribirse. Inténtalo de nuevo.');
        toast.error('Error al suscribirse');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('Suscribiendo...');
      console.log('🔚 [Newsletter] Request flow completed');
    }
  };

  if (success) {
    return (
      <SuccessMessage
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FiCheck size={20} />
        <span>¡Gracias por suscribirte! Revisa tu email para confirmar.</span>
      </SuccessMessage>
    );
  }

  return (
    <FormContainer variant={variant} onSubmit={handleSubmit}>
      <InputGroup variant={variant}>
        <EmailInputWrapper>
          <IconWrapper variant={variant}>
            <FiMail size={variant === 'hero' ? 20 : 18} />
          </IconWrapper>
          <EmailInput
            variant={variant}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </EmailInputWrapper>
        <SubmitButton
          variant={variant}
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block' }}
              >
                ⏳
              </motion.span>
              {loadingMessage}
            </>
          ) : (
            'Suscribirme'
          )}
        </SubmitButton>
      </InputGroup>

      <CheckboxContainer>
        <input
          type="checkbox"
          id="privacy-accept"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          disabled={loading}
        />
        <label htmlFor="privacy-accept">
          Acepto la <a href="/privacy" target="_blank">política de privacidad</a> y recibir emails con
          contenido de pádel
        </label>
      </CheckboxContainer>

      {error && (
        <ErrorMessage
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </ErrorMessage>
      )}
    </FormContainer>
  );
};

export default NewsletterForm;
