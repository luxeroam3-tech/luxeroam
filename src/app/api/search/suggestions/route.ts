import { getSuggestions } from "@/lib/data";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const suggestions = await getSuggestions(query);
  return Response.json({ suggestions });
}
