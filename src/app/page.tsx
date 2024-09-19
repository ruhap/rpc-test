"use client";
import { client } from "@/kurre/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState();
  useEffect(() => {
    const f = async () => {
      const d = await client.getExample({ name: "CLIENTISTÄ TULEE" });
      setData(d);
    };
    f();
    console.log("jeeee", data);
  }, []);
  return <main>{JSON.stringify(data)}</main>;
}
