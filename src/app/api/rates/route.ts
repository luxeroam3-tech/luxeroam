export async function GET() {
  const key = process.env.EXCHANGE_RATE_API_KEY;

  // Free tier only allows the provider's default EUR base, so rebase to USD here.
  const res = await fetch(
    `https://api.exchangerate.host/latest?access_key=${key}`,
    { next: { revalidate: 3600 } },
  );
  const data = await res.json();

  const eurRates: Record<string, number> | undefined = data?.rates;
  const usdPerEur = eurRates?.USD;

  if (!data?.success || !eurRates || !usdPerEur) {
    return Response.json({ error: "rate fetch failed" }, { status: 502 });
  }

  const rates = Object.fromEntries(
    Object.entries(eurRates).map(([code, rate]) => [code, rate / usdPerEur]),
  );

  return Response.json({ base: "USD", rates, updatedAt: data.date });
}
