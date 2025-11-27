import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiTrendingUp, FiUsers, FiZap, FiCheckCircle } from 'react-icons/fi';
import NewsletterForm from '../components/features/NewsletterForm';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fdf8 0%, #e8f5e8 100%);
`;

const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: auto;
    padding: 4rem 1.5rem;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  text-align: center;
  z-index: 10;
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid rgba(22, 163, 74, 0.3);
  border-radius: 50px;
  color: #16a34a;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1.5rem;
  line-height: 1.1;

  .highlight {
    color: #16a34a;
    position: relative;
    display: inline-block;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  color: #6b7280;
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FormWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const TrustIndicators = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  color: #6b7280;
  font-size: 0.875rem;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #16a34a;
  }
`;

const BenefitsSection = styled.section`
  padding: 6rem 2rem;
  background: white;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const BenefitsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled(motion.div)`
  background: linear-gradient(135deg, #f8fdf8 0%, #ffffff 100%);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(22, 163, 74, 0.1);
    border-color: #16a34a;
  }
`;

const BenefitIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  margin-bottom: 1.5rem;
`;

const BenefitTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const BenefitDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
`;

const NewsletterLandingPage: React.FC = () => {
  const benefits = [
    {
      icon: <FiTrendingUp size={28} />,
      title: 'Mejora tu Juego',
      description:
        'Recibe consejos semanales de técnica, estrategia y tácticas de los mejores jugadores profesionales.',
    },
    {
      icon: <FiZap size={28} />,
      title: 'Contenido Exclusivo',
      description:
        'Acceso anticipado a análisis de palas, comparativas detalladas y guías de compra antes que nadie.',
    },
    {
      icon: <FiUsers size={28} />,
      title: 'Comunidad Activa',
      description:
        'Únete a la comunidad de jugadores que ya reciben nuestro contenido y comparten su pasión por el pádel.',
    },
  ];

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <Badge
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiMail size={16} />
            Newsletter Gratuita
          </Badge>

          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Domina el Pádel con{' '}
            <span className="highlight">Contenido Exclusivo</span>
          </Title>

          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Recibe cada semana análisis de palas, consejos de expertos y las últimas novedades del
            mundo del pádel directamente en tu bandeja de entrada.
          </Subtitle>

          <FormWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <NewsletterForm variant="hero" />
          </FormWrapper>

          <TrustIndicators
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TrustItem>
              <FiCheckCircle size={18} />
              <span>100% Gratis</span>
            </TrustItem>
            <TrustItem>
              <FiCheckCircle size={18} />
              <span>Sin Spam</span>
            </TrustItem>
            <TrustItem>
              <FiCheckCircle size={18} />
              <span>Cancela cuando quieras</span>
            </TrustItem>
          </TrustIndicators>
        </HeroContent>
      </HeroSection>

      {/* Benefits Section */}
      <BenefitsSection>
        <SectionTitle>¿Qué recibirás en tu email?</SectionTitle>
        <SectionSubtitle>
          Contenido de valor diseñado para ayudarte a mejorar tu juego y tomar mejores decisiones
        </SectionSubtitle>

        <BenefitsGrid>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitDescription>{benefit.description}</BenefitDescription>
            </BenefitCard>
          ))}
        </BenefitsGrid>
      </BenefitsSection>

    </Container>
  );
};

export default NewsletterLandingPage;
