"use client";

import { useState, type FormEvent } from "react";
import {
  PROFESSIONAL_CATEGORIES,
  CATEGORY_LABELS,
  type ProfessionalCategory,
} from "@/lib/professional-categories";
import {
  SESSION_FORMATS,
  SESSION_FORMAT_LABELS,
  type SessionFormat,
} from "@/lib/session-format";
import { parseTagList } from "@/lib/tags";

type Status = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export function ProfessionalApplyForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ProfessionalCategory>("terapeuta");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [methods, setMethods] = useState("");
  const [personality, setPersonality] = useState("");
  const [sessionFormat, setSessionFormat] = useState<SessionFormat>("online");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [price, setPrice] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);

  const needsLocation = sessionFormat !== "online";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);

    try {
      const response = await fetch("/api/professionals/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          category,
          bio,
          yearsExperience: Number(yearsExperience),
          specialties: parseTagList(specialties),
          methods: parseTagList(methods),
          personality: personality || undefined,
          sessionFormat,
          locationCity: needsLocation ? locationCity : undefined,
          locationState: needsLocation ? locationState : undefined,
          locationAddress: needsLocation ? locationAddress || undefined : undefined,
          priceCents,
          credentialDocumentUrl: credentialUrl || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }

      setDashboardToken(data.dashboardToken ?? null);
      setStatus("success");
      setMessage(
        "Candidatura recebida! Vamos verificar suas credenciais e avisar em até 7 dias úteis."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar agora. Tente novamente."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-light px-6 py-5 text-center">
        <p className="font-medium text-primary-dark">{message}</p>
        {dashboardToken && (
          <>
            <p className="mt-3 text-sm text-primary-dark">
              Guarde este link — é dele que você acompanha o status da
              candidatura e, depois de aprovado(a), gerencia sua agenda e
              suas sessões, sem precisar de senha:
            </p>
            <a
              href={`/p/${dashboardToken}`}
              className="mt-2 inline-block break-all text-sm font-medium text-primary-dark underline"
            >
              /p/{dashboardToken}
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="apply-full-name">
            Nome completo
          </label>
          <input
            id="apply-full-name"
            required
            minLength={3}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={fieldClass}
            placeholder="Maria Silva"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="apply-email">
            Email
          </label>
          <input
            id="apply-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            placeholder="maria@email.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="apply-category">
            Categoria
          </label>
          <select
            id="apply-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ProfessionalCategory)
            }
            className={fieldClass}
          >
            {PROFESSIONAL_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="apply-years">
            Anos de experiência
          </label>
          <input
            id="apply-years"
            type="number"
            min={0}
            max={60}
            required
            value={yearsExperience}
            onChange={(event) => setYearsExperience(event.target.value)}
            className={fieldClass}
            placeholder="8"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="apply-price">
            Preço por sessão (R$)
          </label>
          <input
            id="apply-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={fieldClass}
            placeholder="250"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="apply-bio">
          Fale sobre sua experiência
        </label>
        <textarea
          id="apply-bio"
          required
          minLength={20}
          rows={4}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className={fieldClass}
          placeholder="Formação, trajetória, o que te trouxe até aqui..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="apply-specialties">
            Especialidades
          </label>
          <input
            id="apply-specialties"
            required
            value={specialties}
            onChange={(event) => setSpecialties(event.target.value)}
            className={fieldClass}
            placeholder="Ansiedade, Casais, Burnout"
          />
          <p className="mt-1.5 text-xs text-ink-soft">Separe por vírgula.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="apply-methods">
            Métodos/abordagens que utiliza
          </label>
          <input
            id="apply-methods"
            value={methods}
            onChange={(event) => setMethods(event.target.value)}
            className={fieldClass}
            placeholder="TCC, Mindfulness, Coaching ontológico"
          />
          <p className="mt-1.5 text-xs text-ink-soft">
            Opcional. Separe por vírgula.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="apply-personality">
          Como você descreveria seu estilo de atendimento?
        </label>
        <input
          id="apply-personality"
          value={personality}
          onChange={(event) => setPersonality(event.target.value)}
          className={fieldClass}
          placeholder="Acolhedor e estruturado, direto ao ponto, provocador..."
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Opcional — ajuda o cliente a saber se combina com você.
        </p>
      </div>

      <fieldset>
        <legend className={labelClass}>Formato de atendimento</legend>
        <div className="flex flex-wrap gap-4">
          {SESSION_FORMATS.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm text-ink"
            >
              <input
                type="radio"
                name="session-format"
                value={value}
                checked={sessionFormat === value}
                onChange={() => setSessionFormat(value)}
              />
              {SESSION_FORMAT_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {needsLocation && (
        <div className="grid gap-5 rounded-xl border border-border bg-paper p-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="apply-city">
              Cidade
            </label>
            <input
              id="apply-city"
              required
              value={locationCity}
              onChange={(event) => setLocationCity(event.target.value)}
              className={fieldClass}
              placeholder="São Paulo"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="apply-state">
              Estado (UF)
            </label>
            <input
              id="apply-state"
              required
              maxLength={2}
              value={locationState}
              onChange={(event) =>
                setLocationState(event.target.value.toUpperCase())
              }
              className={fieldClass}
              placeholder="SP"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="apply-address">
              Endereço (opcional)
            </label>
            <input
              id="apply-address"
              value={locationAddress}
              onChange={(event) => setLocationAddress(event.target.value)}
              className={fieldClass}
              placeholder="Rua, número, bairro"
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="apply-credential">
          Link do diploma/certificação (opcional por enquanto)
        </label>
        <input
          id="apply-credential"
          type="url"
          value={credentialUrl}
          onChange={(event) => setCredentialUrl(event.target.value)}
          className={fieldClass}
          placeholder="https://drive.google.com/..."
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Aceito qualquer link acessível (Drive, PDF público, portfólio). Upload
          direto de arquivo chega numa próxima versão.
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Enviando…" : "Enviar candidatura"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}
