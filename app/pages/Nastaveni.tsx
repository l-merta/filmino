"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, X } from "lucide-react";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import UserAvatar from "@/components/UserAvatar";
import ShareLinksManager from "@/components/collections/ShareLinksManager";
import { collectionsApi, errorMessage, usersApi, type LanguagePref, type PublicUser } from "@/lib/collections";
import { cn } from "@/lib/utils";

type Me = Awaited<ReturnType<typeof usersApi.me>>;
type Msg = { type: "ok" | "error"; text: string } | null;

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-5 flex flex-col gap-4">
      <div>
        <h2 className="font-bold text-xl">{title}</h2>
        {description && <p className="text-sm opacity-70 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <p className={msg.type === "ok" ? "text-sm opacity-80" : "text-sm text-destructive"}>{msg.text}</p>;
}

const LANGUAGE_OPTIONS: { value: LanguagePref; label: string }[] = [
  { value: "cs", label: "Čeština" },
  { value: "en", label: "Angličtina" },
  { value: "original", label: "Původní jazyk" },
];

/** Three buttons in a row, one of them selected. */
function LanguagePicker({ label, value, onChange }: { label: string; value: LanguagePref; onChange: (v: LanguagePref) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {LANGUAGE_OPTIONS.map((o) => (
          <Button
            key={o.value}
            type="button"
            size="sm"
            role="radio"
            aria-checked={value === o.value}
            variant={value === o.value ? "default" : "outline"}
            className={cn(value !== o.value && "button-outline")}
            onClick={() => value !== o.value && onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

const loadProfileLinks = () => usersApi.profileShareLinks();
const createProfileLink = (_kind: "view" | "invite", label?: string) => usersApi.createProfileShareLink(label);

/** /nastaveni — account settings */
export default function Nastaveni() {
  const router = useRouter();
  const { status, update: updateSession } = useSession() ?? {};
  const [me, setMe] = useState<Me | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [accountMsg, setAccountMsg] = useState<Msg>(null);
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);
  const [privacyMsg, setPrivacyMsg] = useState<Msg>(null);
  const [languageMsg, setLanguageMsg] = useState<Msg>(null);
  const [followers, setFollowers] = useState<PublicUser[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prihlaseni");
    if (status !== "authenticated") return;
    usersApi.me().then((m) => {
      setMe(m);
      setUsername(m.username);
      setEmail(m.email);
    });
    usersApi.followRequests().then((r) => setFollowers(r.followers)).catch(() => {});
  }, [status, router]);

  if (!me) {
    return (
      <div className="page-filmy">
        <Header />
        <main className="main-container section-spacing"><p className="opacity-70">Načítám…</p></main>
      </div>
    );
  }

  const emailChanged = email.trim().toLowerCase() !== me.email.toLowerCase();

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg(null);
    try {
      await usersApi.updateMe({ username, email, currentPassword: emailChanged ? currentPassword : undefined });
      setMe({ ...me, username: username.trim(), email: email.trim() });
      await updateSession?.(); // refresh the name shown in the header
      setCurrentPassword("");
      setAccountMsg({ type: "ok", text: "Údaje uloženy" });
    } catch (err) {
      setAccountMsg({ type: "error", text: errorMessage(err) });
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) return setPasswordMsg({ type: "error", text: "Hesla se neshodují" });
    try {
      await usersApi.updateMe({ newPassword, currentPassword });
      setMe({ ...me, hasPassword: true });
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordMsg({ type: "ok", text: "Heslo změněno" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: errorMessage(err) });
    }
  };

  const setPublic = async (isPublic: boolean) => {
    setPrivacyMsg(null);
    try {
      await usersApi.updateMe({ isPublic });
      setMe({ ...me, isPublic });
      setPrivacyMsg({ type: "ok", text: isPublic ? "Profil je veřejný" : "Profil je soukromý" });
    } catch (err) {
      setPrivacyMsg({ type: "error", text: errorMessage(err) });
    }
  };

  const setLanguage = async (key: "textLanguage" | "imageLanguage", value: LanguagePref) => {
    if (!me) return;
    setLanguageMsg(null);
    try {
      await usersApi.updateMe({ [key]: value });
      setMe({ ...me, [key]: value });
      setLanguageMsg({ type: "ok", text: "Uloženo – projeví se při dalším načtení stránky" });
    } catch (err) {
      setLanguageMsg({ type: "error", text: errorMessage(err) });
    }
  };

  const removeFollower = async (id: string) => {
    await usersApi.removeFollower(id);
    setFollowers((f) => f.filter((u) => u.id !== id));
  };

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing !gap-6">
        <div className="max-w-180 w-full mx-auto flex flex-col gap-6">
          <Link href="/profil" className="flex items-center gap-2 opacity-70 hover:opacity-100 w-fit">
            <ArrowLeft size={16} /> Zpět na profil
          </Link>
          <h1 className="text-3xl font-bold">Nastavení účtu</h1>

          <Card title="Účet">
            <form onSubmit={saveAccount} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Uživatelské jméno
                <Input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                E-mail
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              {emailChanged && me.hasPassword && (
                <label className="flex flex-col gap-1 text-sm">
                  Současné heslo (pro potvrzení změny e-mailu)
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </label>
              )}
              <Message msg={accountMsg} />
              <Button type="submit" className="w-fit">Uložit</Button>
            </form>
          </Card>

          <Card title={me.hasPassword ? "Změna hesla" : "Nastavit heslo"} description={!me.hasPassword ? "Přihlašujete se přes Google. Nastavením hesla se budete moci přihlásit i jménem a heslem." : undefined}>
            <form onSubmit={savePassword} className="flex flex-col gap-3">
              {me.hasPassword && (
                <Input type="password" placeholder="Současné heslo" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              )}
              <Input type="password" placeholder="Nové heslo (min. 8 znaků)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
              <Input type="password" placeholder="Potvrzení nového hesla" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Message msg={passwordMsg} />
              <Button type="submit" className="w-fit">Změnit heslo</Button>
            </form>
          </Card>

          <Card title="Soukromí">
            <Switch
              checked={me.isPublic}
              onChange={setPublic}
              label="Veřejný profil"
              description="Veřejný profil a veřejné kolekce uvidí kdokoli. U soukromého profilu musíte žádosti o sledování schválit."
            />
            <Message msg={privacyMsg} />
          </Card>

          <Card
            title="Jazyk"
            description="V jakém jazyce se mají zobrazovat názvy a popisy filmů a v jakém plakáty a loga. „Původní jazyk“ je jazyk, ve kterém film vznikl. Když překlad neexistuje, použije se dostupná verze."
          >
            <LanguagePicker label="Texty" value={me.textLanguage} onChange={(v) => setLanguage("textLanguage", v)} />
            <LanguagePicker label="Obrázky" value={me.imageLanguage} onChange={(v) => setLanguage("imageLanguage", v)} />
            <Message msg={languageMsg} />
          </Card>

          <Card
            title="Odkazy na profil"
            description="Kdo má odkaz, uvidí váš profil i když je soukromý. Odkaz můžete kdykoli smazat a přístup tím zrušit."
          >
            <ShareLinksManager kinds={["view"]} load={loadProfileLinks} create={createProfileLink} remove={collectionsApi.deleteShareLink} />
          </Card>

          <Card title="Sledující" description={followers.length === 0 ? "Zatím vás nikdo nesleduje." : undefined}>
            {followers.length > 0 && (
              <ul className="flex flex-col gap-2">
                {followers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <UserAvatar user={u} className="size-8" />
                    <Link href={`/uzivatel/${u.id}`} className="flex-1 hover:opacity-70">{u.username}</Link>
                    <Button size="sm" variant="outline" className="button-outline" onClick={() => removeFollower(u.id)}><X /> Odebrat</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
