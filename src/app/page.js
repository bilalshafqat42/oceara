import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section
          id="home"
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: "120px 40px 40px",
            background: "#1f5f6f",
            color: "#ffffff",
          }}
        >
          <h1
            className="font-heading"
            style={{
              maxWidth: "1000px",
              fontSize: "clamp(56px, 8vw, 120px)",
              fontWeight: 400,
              lineHeight: 0.95,
              textAlign: "center",
            }}
          >
            A Life Shaped by Sea and Serenity
          </h1>
        </section>

        <section
          id="overview"
          style={{
            minHeight: "100vh",
            padding: "160px 40px",
          }}
        >
          <h2 className="font-heading">Overview</h2>
        </section>

        <section
          id="residences"
          style={{
            minHeight: "100vh",
            padding: "160px 40px",
          }}
        >
          <h2 className="font-heading">Residences</h2>
        </section>

        <section
          id="location"
          style={{
            minHeight: "100vh",
            padding: "160px 40px",
          }}
        >
          <h2 className="font-heading">Location</h2>
        </section>

        <section
          id="amenities"
          style={{
            minHeight: "100vh",
            padding: "160px 40px",
          }}
        >
          <h2 className="font-heading">Amenities</h2>
        </section>

        <section
          id="contact"
          style={{
            minHeight: "100vh",
            padding: "160px 40px",
            background: "#006f91",
            color: "#ffffff",
          }}
        >
          <h2 className="font-heading">Contact</h2>
        </section>
      </main>
    </>
  );
}
