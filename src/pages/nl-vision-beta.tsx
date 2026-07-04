export default function NLVisionBeta() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
        NeuroLjus · Archived Prototype Access
      </h1>
      <p style={{ maxWidth: "720px", color: "#475569" }}>
        This archived prototype access surface is not an active beta, clinical workflow,
        institutional pilot, or production app.
      </p>
      <div style={{ width: "100%", maxWidth: "900px", aspectRatio: "16/9", marginTop: "16px" }}>
        <iframe
          src="/labs/nl-vision-beta/index.html"
          style={{ width: "100%", height: "100%", border: "1px solid #ccc", borderRadius: "8px" }}
          title="Archived NL-VISION prototype access"
        />
      </div>
    </main>
  );
}
