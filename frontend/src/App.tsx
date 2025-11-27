import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ScrollToTop } from './components/common/ScrollToTop';
import NewsletterLandingPage from './pages/NewsletterLandingPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path='/' element={<NewsletterLandingPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Layout>
    </>
  );
}
