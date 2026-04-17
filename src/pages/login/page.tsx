import { LoginPageView } from './ui/LoginPageView';
import { useLoginPageViewModel } from './model/use-login-page-view-model';

export default function LoginPage() {
  const viewModel = useLoginPageViewModel();

  return <LoginPageView viewModel={viewModel} />;
}
