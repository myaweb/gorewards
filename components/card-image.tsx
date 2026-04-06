"use client"

interface CardImageProps {
  name: string
  bank: string
  network: string
  imageUrl?: string | null
  className?: string
}

// Real brand colors per bank
const BANK_THEMES: Record<string, { bg: string; accent: string; text: string }> = {
  "TD":               { bg: "#1A4A2E",  accent: "#2ECC71", text: "#ffffff" },
  "RBC":              { bg: "#003168",  accent: "#FFCC00", text: "#ffffff" },
  "CIBC":             { bg: "#8B0000",  accent: "#C8102E", text: "#ffffff" },
  "Scotiabank":       { bg: "#C8102E",  accent: "#FFCC00", text: "#ffffff" },
  "BMO":              { bg: "#0079C1",  accent: "#FFFFFF", text: "#ffffff" },
  "American Express": { bg: "#016FD0",  accent: "#60B4E8", text: "#ffffff" },
  "National Bank":    { bg: "#E31837",  accent: "#FFFFFF", text: "#ffffff" },
  "Tangerine":        { bg: "#FF6600",  accent: "#FFB347", text: "#ffffff" },
  "Desjardins":       { bg: "#00843D",  accent: "#FFCD00", text: "#ffffff" },
  "PC Financial":     { bg: "#1A1A2E",  accent: "#E63946", text: "#ffffff" },
  "Simplii Financial":{ bg: "#E4002B",  accent: "#FFFFFF", text: "#ffffff" },
  "Rogers":           { bg: "#DA291C",  accent: "#FFFFFF", text: "#ffffff" },
  "MBNA":             { bg: "#003087",  accent: "#009CDE", text: "#ffffff" },
  "Home Trust":       { bg: "#1B3A6B",  accent: "#F5A623", text: "#ffffff" },
  "Canadian Tire":    { bg: "#CC0000",  accent: "#FFFFFF", text: "#ffffff" },
  "Costco":           { bg: "#005DAA",  accent: "#E31837", text: "#ffffff" },
  "Marriott":         { bg: "#8B1A1A",  accent: "#C9A84C", text: "#ffffff" },
}

const NETWORK_COLORS: Record<string, { primary: string; secondary: string }> = {
  VISA:       { primary: "#1A1F71", secondary: "#F7B600" },
  MASTERCARD: { primary: "#EB001B", secondary: "#F79E1B" },
  AMEX:       { primary: "#016FD0", secondary: "#60B4E8" },
}

function getTheme(bank: string) {
  for (const key of Object.keys(BANK_THEMES)) {
    if (bank.toLowerCase().includes(key.toLowerCase())) {
      return BANK_THEMES[key]
    }
  }
  // fallback: dark slate
  return { bg: "#1E293B", accent: "#06B6D4", text: "#ffffff" }
}

function getBankShortName(bank: string): string {
  const shorts: Record<string, string> = {
    "American Express": "AMEX",
    "Simplii Financial": "Simplii",
    "PC Financial": "PC",
    "Canadian Tire": "CT",
    "National Bank": "NBC",
    "Home Trust": "HomeTrust",
  }
  for (const [k, v] of Object.entries(shorts)) {
    if (bank.toLowerCase().includes(k.toLowerCase())) return v
  }
  return bank
}

function getCardLabel(name: string): string {
  // Strip bank name prefix words and return the product name
  const stopWords = ["american", "express", "td", "rbc", "cibc", "scotiabank", "bmo",
    "national", "bank", "tangerine", "desjardins", "simplii", "financial",
    "rogers", "mbna", "home", "trust", "canadian", "tire", "costco", "marriott", "pc"]
  const words = name.split(" ").filter(w => !stopWords.includes(w.toLowerCase()))
  return words.slice(0, 4).join(" ")
}

export function CardImage({ name, bank, network, imageUrl, className = "" }: CardImageProps) {
  const hasRealImage = imageUrl && !imageUrl.includes("placeholder")

  if (hasRealImage) {
    return (
      <div className={`rounded-xl overflow-hidden bg-[#0f1117] flex items-center justify-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
      </div>
    )
  }

  const theme = getTheme(bank)
  const net = NETWORK_COLORS[network?.toUpperCase()] || NETWORK_COLORS.VISA
  const shortBank = getBankShortName(bank)
  const cardLabel = getCardLabel(name)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg}CC 60%, ${theme.accent}33 100%)` }}
    >
      {/* Background glow circles */}
      <div
        className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-20"
        style={{ background: theme.accent }}
      />
      <div
        className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full opacity-10"
        style={{ background: theme.accent }}
      />

      {/* Top row: bank name + network ring */}
      <div className="absolute top-4 left-5 right-5 flex items-start justify-between">
        <span
          className="text-base font-bold tracking-wide leading-none"
          style={{ color: theme.accent }}
        >
          {shortBank}
        </span>

        {/* Network circle (like the image) */}
        <div
          className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: theme.accent + "99", background: "transparent" }}
        >
          {network?.toUpperCase() === "MASTERCARD" ? (
            <div className="flex">
              <div className="w-4 h-4 rounded-full opacity-90" style={{ background: net.primary }} />
              <div className="w-4 h-4 rounded-full -ml-2 opacity-80" style={{ background: net.secondary }} />
            </div>
          ) : (
            <span className="text-[8px] font-black" style={{ color: theme.accent }}>
              {network?.toUpperCase() === "AMEX" ? "AMEX" : "VISA"}
            </span>
          )}
        </div>
      </div>

      {/* Chip */}
      <div
        className="absolute rounded-md"
        style={{
          top: "42%",
          left: "1.25rem",
          width: "2.2rem",
          height: "1.6rem",
          background: `linear-gradient(135deg, ${theme.accent}CC, ${theme.accent}66)`,
          border: `1px solid ${theme.accent}88`,
        }}
      >
        {/* chip lines */}
        <div className="absolute inset-x-1 top-1/2 -translate-y-px h-px opacity-40" style={{ background: theme.bg }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-px w-px opacity-40" style={{ background: theme.bg }} />
      </div>

      {/* Card number dots */}
      <div className="absolute flex gap-3" style={{ top: "62%", left: "1.25rem" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-0.5">
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                className="w-1 h-1 rounded-full opacity-40"
                style={{ background: theme.text }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Card label bottom */}
      <div className="absolute bottom-4 left-5 right-5">
        <p className="text-xs font-semibold opacity-80 truncate" style={{ color: theme.text }}>
          {cardLabel}
        </p>
      </div>
    </div>
  )
}

