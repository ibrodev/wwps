export default async function Home() {
  const data = await fetch(
  `${process.env.BACKEND_URL}/api/health`
)
  const r = await data.json()

  return (
    <>
      <h1>Hello Next</h1>
      <pre>
        {r.status}
      </pre>
    </>
  );
}
