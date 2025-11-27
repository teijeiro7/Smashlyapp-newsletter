import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  padding: 0;
  box-shadow: 0 2px 20px rgba(22, 163, 74, 0.15);
  top: 0;
  z-index: 100;
  position: relative;
  padding-left: 60px;
`;

const HeaderContent = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 80px);  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 70px;
  width: 100%;
  
  @media (max-width: 1600px) {
    padding: 0 clamp(20px, 3vw, 60px);
  }
  
  @media (max-width: 1200px) {
    padding: 0 clamp(20px, 2vw, 40px);
  }
  
  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;

  img {
    height: 75px;
    width: auto;
    transition: transform 0.2s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to='/'>
          <img src='/images/icons/smashly-large-icon.ico' alt='Smashly' />
        </Logo>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
