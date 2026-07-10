export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        alignContent: "center",
        gap: "24px",
        padding: "40px",
      }}
    >
      <p>Inter body font</p>

      <h1
        className="font-heading"
        style={{
          fontSize: "80px",
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        Minerva Modern Heading
      </h1>

      <p
        className="font-curve"
        style={{
          fontSize: "48px",
        }}
      >
        Kinan Decorative Text
      </p>
    </main>
  );
}
