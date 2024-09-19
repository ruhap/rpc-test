import { client } from "@/kurre/client";

export default async function Home() {
  const data = await client.getExample({ name: "Your Name" }); 
  return (
    <main>
    {JSON.stringify(data)}
    </main>
  );
}
