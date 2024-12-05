import { Metadata } from "next";
import ServiceCard from "@/[locale]/components/ServiceCard";

export const generateMetadata = async ({ params }: { params: { category: string } }): Promise<Metadata> => {
  return {
    title: `${params.category} Hizmetleri`,
    description: `${params.category} kategorisindeki profesyonelleri keşfedin.`,
  };
};

async function fetchServices(category: string) {
  const res = await fetch(`https://api.example.com/services?category=${category}`);
  if (!res.ok) throw new Error("Hizmetler alınamadı");
  return res.json();
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const services = await fetchServices(params.category);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{params.category} Hizmetleri</h1>
      <div className="grid grid-cols-3 gap-6">
        {services.map((service: { id: string; title: string; description: string; price: number }) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
