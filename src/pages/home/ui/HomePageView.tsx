import type { FormEvent } from 'react';
import { observer } from 'mobx-react-lite';
import type { HomePageViewModel } from '../model/home-page-view-model';
import { AboutSection } from './AboutSection';
import { AdvantagesSection } from './AdvantagesSection';
import { ContactSection } from './ContactSection';
import { HeroSection } from './HeroSection';
import { ServicesSection } from './ServicesSection';
import { TestimonialsSection } from './TestimonialsSection';

interface HomePageViewProps {
  viewModel: HomePageViewModel;
}

export const HomePageView = observer(({ viewModel }: HomePageViewProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void viewModel.submitTestimonial();
  };

  return (
    <>
      <HeroSection />
      <ServicesSection
        services={viewModel.services}
        expandedServiceId={viewModel.expandedServiceId}
        loading={viewModel.servicesLoading}
        message={viewModel.servicesMessage}
        serviceCountLabel={viewModel.serviceCountLabel}
        onToggleService={viewModel.toggleService}
      />
      <AdvantagesSection />
      <AboutSection />
      <TestimonialsSection
        reviews={viewModel.reviews}
        loading={viewModel.reviewsLoading}
        message={viewModel.reviewsMessage}
        formVisible={viewModel.formVisible}
        formData={viewModel.testimonialForm}
        submitPending={viewModel.submitState.pending}
        submitMessage={viewModel.submitState.message}
        submitTone={viewModel.submitState.tone}
        onToggleForm={viewModel.toggleFormVisibility}
        onFieldChange={viewModel.setTestimonialField}
        onSubmit={handleSubmit}
      />
      <ContactSection />
    </>
  );
});
