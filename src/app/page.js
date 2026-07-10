import Header from "@/components/Header";

const sections = [
  "about",
  "location",
  "amenities",
  "payment-plan",
  "contact",
];

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section
          id="home"
          style={{
            minHeight: "100svh",
            background: "#ffffff",
          }}
        />

        {sections.map((section) => (
          <section
            key={section}
            id={section}
            style={{
              minHeight: "100svh",
              padding: "140px 40px",
              background:
                section === "contact"
                  ? "#0d78a6"
                  : "#f2ede5",
            }}
          >
            <h2
              className="font-heading"
              style={{
                fontSize: "64px",
                fontWeight: 400,
                textTransform: "capitalize",
              }}
            >
              {section.replace("-", " ")}
            </h2>
          </section>
        ))}
      </main>
    </>
  );
}