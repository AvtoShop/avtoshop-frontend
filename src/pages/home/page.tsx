import { HomePageView } from './ui/HomePageView';
import { useHomePageViewModel } from './model/use-home-page-view-model';

export default function HomePage() {
  const viewModel = useHomePageViewModel();

  return <HomePageView viewModel={viewModel} />;
}
