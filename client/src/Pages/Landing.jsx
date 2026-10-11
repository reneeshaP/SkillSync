import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import ValueStrip from '../components/landing/ValueStrip';
import HowItWorks from '../components/landing/HowItWorks';
import FeatureGrid from '../components/landing/FeatureGrid';
import AudienceSplit from '../components/landing/AudienceSplit';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <LandingNav />
      <Hero />
      <ValueStrip />
      <HowItWorks />
      <FeatureGrid />
      <AudienceSplit />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
