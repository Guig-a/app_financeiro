type LancamentoDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LancamentoDetailsPage({
  params,
}: LancamentoDetailsPageProps) {
  const { id } = await params;
  return (
    <section>
      <h2 className="text-xl font-semibold">Detalhe do lançamento</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        ID: <span className="font-numeric">{id}</span>
      </p>
    </section>
  );
}
