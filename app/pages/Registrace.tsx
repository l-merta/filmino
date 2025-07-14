"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/apiClient";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export default function Registrace() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate form data
      if (!formData.username || !formData.email || !formData.password) {
        throw new Error("Všechna pole jsou povinná");
      }

      if (formData.password.length < 6) {
        throw new Error("Heslo musí mít alespoň 6 znaků");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Neplatný formát e-mailu");
      }

      // Make API call
      await apiPost("/auth/register", formData);
      
      setMessage({ type: "success", text: "Registrace byla úspěšná! Můžete se přihlásit." });
      setFormData({ username: "", email: "", password: "" });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Došlo k chybě při registraci";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Registrace</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Uživatelské jméno
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Zadejte uživatelské jméno"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Zadejte e-mail"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Heslo
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Zadejte heslo (min. 6 znaků)"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Registruji..." : "Registrovat"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Už máte účet?{" "}
              <a href="/prihlaseni" className="text-primary hover:underline">
                Přihlaste se
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}