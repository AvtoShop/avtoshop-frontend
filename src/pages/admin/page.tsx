import { AdminPageView } from './ui/AdminPageView';
import { useAdminPageViewModel } from './model/use-admin-page-view-model';

export default function AdminPage() {
  const viewModel = useAdminPageViewModel();

  return <AdminPageView viewModel={viewModel} />;
}
