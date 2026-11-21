import { Suspense } from "react";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/data/admin/settings";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Delivery fee and contact numbers shown in the shop." />
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const settings = await getAdminSettings();
  return <SettingsForm settings={settings} action={saveSettings} />;
}
