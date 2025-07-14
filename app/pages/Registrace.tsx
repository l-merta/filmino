"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";

import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export default function Registrace() {
  const router = useRouter();
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

      if (formData.password.length < 8) {
        throw new Error("Heslo musí mít alespoň 8 znaků");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Neplatný formát e-mailu");
      }

      // Make API call
      await apiPost("/auth/register", formData);
      
      // Auto-login after successful registration
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: "error", text: "Registrace proběhla, ale přihlášení selhalo" });
      } else {
        setMessage({ type: "success", text: "Registrace byla úspěšná" });
        // Redirect to /filmy after successful login
        router.push("/filmy");
      }
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
        <div className="max-w-80 w-full mx-auto space-y-4">
          <h1 className="text-3xl font-bold text-center mb-8">Registrace</h1>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Uživatelské jméno"
                required
              />
            </div>
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-mail"
                required
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Heslo (min. 6 znaků)"
                required
              />
            </div>
            {message && (
              <div
                className={`text-sm opacity-90`}
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Už máte účet?{" "}
              <a href="/prihlaseni" className="text-primary hover:underline">
                Přihlaste se
              </a>
            </p>
          </div>
          <div className="w-full flex items-center justify-center gap-2">
            <Separator className="!w-full flex-1/2" />
            <span>Nebo</span>
            <Separator className="!w-full flex-1/2" />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/filmy" })}
          >
            Registrovat se přes Google
          </Button>
        </div>
      </main>
    </div>
  );
}