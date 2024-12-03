export default function ServiceCard({ service }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span>{service.price} CHF</span>
    </div>
  );
}
