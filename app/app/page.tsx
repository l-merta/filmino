"use client";

import { useState, useEffect } from "react";

import Welcome from "@/pages/Welcome";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isMounted) return <Welcome />;
}
