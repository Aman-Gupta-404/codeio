import ClientLayout from "../client-layout";

interface Props {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

async function Layout({ children, params }: Props) {
  const { projectId } = await params;

  return <ClientLayout projectId={projectId}>{children}</ClientLayout>;
}

export default Layout;
