export default async function Home() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.href='/index.html'`,
      }}
    />
  )
}
