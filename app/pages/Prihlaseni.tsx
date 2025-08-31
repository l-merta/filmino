"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LoginFormData {
  username: string;
  password: string;
}

export default function Prihlaseni() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
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
      if (!formData.username || !formData.password) {
        throw new Error("Všechna pole jsou povinná");
      }

      // Sign in with credentials
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: "error", text: "Nesprávné uživatelské jméno nebo heslo" });
      } else {
        setMessage({ type: "success", text: "Přihlášení bylo úspěšné" });
        // Redirect to /filmy after successful login
        router.push("/filmy");
      }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Došlo k chybě při přihlašování";
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
          <h1 className="text-3xl font-bold text-center mb-8">Přihlášení</h1>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Uživatelské jméno nebo e-mail"
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
                placeholder="Heslo"
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
              {isLoading ? "Přihlašuji..." : "Přihlásit se"}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Nemáte ještě účet?{" "}
              <a href="/registrace" className="text-primary hover:underline">
                Registrujte se
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
            Přihlásit se přes Google
          </Button>
        </div>
      </main>
    </div>
  );
}