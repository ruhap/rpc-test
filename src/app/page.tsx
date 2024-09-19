"use client";
import { client } from "@/kurre/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<{ message: string }>();

  useEffect(() => {
    const f = async () => {
      const d = await client.getExample.$get({ input: { name: "olmaooo" } });
      await client.createHello.$post({ input: { message: "olmaooo" } });
      setData(d);
    };
    f();
  }, []);

  return <main>{JSON.stringify(data)}</main>;
}
