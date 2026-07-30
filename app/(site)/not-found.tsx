import NotFoundVisual from "@/components/NotFoundVisual";

export const metadata = {
  title: "404 - Page Not Found | Fynix Digital",
  description: "The page you are looking for isn't here. Head back to the homepage or explore our services.",
};

export default function NotFound() {
  return (
    <section className="flex-1 w-full flex flex-col items-center justify-center p-0 m-0 overflow-hidden">
      <NotFoundVisual />
    </section>
  );
}
