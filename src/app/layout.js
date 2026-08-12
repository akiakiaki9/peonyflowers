import './globals.css'

export const metadata = {
  title: 'Peony Flowers | Цветочный магазин в Бухаре | Заказать цветы в Бухаре с доставкой',
  description: 'Свежие цветы с доставкой по Бухаре. Букеты на любой вкус. Работаем 24/7. Закажите букет с доставкой по городу.',
  keywords: 'цветы, букеты, доставка цветов, цветочный магазин, Бухара, свежие цветы, Peony Flowers, цветы с доставкой',
  authors: [{ name: 'Peony Flowers' }],
  creator: 'Akbar Soft',
  publisher: 'Peony Flowers',
  robots: 'index, follow',
  openGraph: {
    title: 'Peony Flowers | Цветочный магазин в Бухаре',
    description: 'Свежие цветы с доставкой по Бухаре. Букеты на любой вкус. Работаем 24/7.',
    url: 'https://peonyflowers.uz',
    siteName: 'Peony Flowers',
    images: [
      {
        url: '/images/logo.png',
        width: 500,
        height: 500,
        alt: 'Peony Flowers Logo',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peony Flowers | Цветочный магазин',
    description: 'Свежие цветы с доставкой по Бухаре. Букеты на любой вкус.',
    images: ['/images/logo.png'],
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  verification: {
    google: 'google-site-verification-code', // Замените на ваш код верификации
  },
  alternates: {
    canonical: 'https://peonyflowers.uz',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <meta name="theme-color" content="#e8a0b4" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Schema.org структурированные данные */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Peony Flowers",
              "image": "https://peonyflowers.uz/images/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bukhara",
                "addressCountry": "UZ"
              },
              "telephone": "+998940837700",
              "openingHours": "Mo-Su 00:00-23:59",
              "priceRange": "$$",
              "sameAs": [
                "https://www.instagram.com/peony_flowers_bukhara/",
                "https://t.me/gullar_sovgalar"
              ]
            })
          }}
        />

        {/* Open Graph мета-теги */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Peony Flowers | Цветочный магазин в Бухаре" />
        <meta property="og:description" content="Свежие цветы с доставкой по Бухаре. Букеты на любой вкус." />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:url" content="https://peonyflowers.uz" />
        <meta property="og:site_name" content="Peony Flowers" />
        <meta property="og:locale" content="ru_RU" />

        {/* Twitter мета-теги */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Peony Flowers | Цветочный магазин" />
        <meta name="twitter:description" content="Свежие цветы с доставкой по Бухаре. Букеты на любой вкус." />
        <meta name="twitter:image" content="/images/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}