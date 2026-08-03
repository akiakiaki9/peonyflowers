import './globals.css'

export const metadata = {
  title: 'Peony Flowers | Цветочный магазин',
  description: 'Свежие цветы с доставкой по городу. Букеты на любой вкус',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}