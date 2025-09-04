import { Assistant } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/entity-theme";
import { Toaster } from "sonner";

const assistant = Assistant({
    variable: "--font-assistant",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    display: "optional",
});

export const metadata = {
    title: "Entity | Enterprise Bot Protection & Fraud Prevention",
    description:
        "Entity Antibot is an enterprise-grade API for bot blocking, fraud prevention, and secure smartlink protection. Stop scrapers, fake clicks, and datacenter traffic in real time.",
    keywords: [
        "Entity Antibot",
        "Bot Protection API",
        "Fraud Prevention",
        "Enterprise Security",
        "Smartlink Security",
        "Anti-Scraper",
        "Click Fraud Protection",
        "IP Blocking",
        "Geo Restriction",
        "ASN Protection",
    ],
    authors: [{ name: "Entity Security Team", url: "https://entitygate.com" }],
    creator: "Entity Security",
    publisher: "Entity",
    metadataBase: new URL("https://entitygate.com"),
    openGraph: {
        title: "Entity Antibot - Enterprise Bot Protection",
        description:
            "Secure your links and apps with Entity Antibot. Enterprise-grade protection against bots, scrapers, fake clicks, and invalid traffic.",
        url: "https://entitygate.com",
        siteName: "Entity Antibot",
        images: [
            {
                url: "https://entitygate.com/entity.png",
                width: 1200,
                height: 630,
                alt: "Entity Antibot Security",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Entity Antibot - Enterprise Bot Protection",
        description:
            "Premium bot detection & smartlink security. Protect campaigns, block bots, and stop fraud in real-time.",
        images: ["https://entitygate.com/entity.png"],
        creator: "@entitysecurity",
    },
    icons: {
        icon: "https://entitygate.com/favicon.ico",
    },
    category: "security",
};

export default function RootLayout({ children }) {
    return (
        <html className={assistant.variable} lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body
                className={`antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                    <Toaster richColors position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
