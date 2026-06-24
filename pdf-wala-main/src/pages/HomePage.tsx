import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { HeroSection } from '../components/sections/HeroSection';
import { ToolsSection } from '../components/sections/ToolsSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { FAQSection } from '../components/sections/FAQSection';

export const HomePage: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <HeroSection />
      <ToolsSection />
      <FeaturesSection />
      <FAQSection />
    </MainLayout>
  );
};
