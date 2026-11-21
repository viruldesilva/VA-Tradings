import { TrackForm } from "./track-form";

export const metadata = {
  title: "Track my order",
  description: "Check the status of your order with your order number and phone number.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">Track my order</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Enter the order number from your confirmation and the mobile number you used at checkout.
      </p>
      <TrackForm />
    </div>
  );
}
