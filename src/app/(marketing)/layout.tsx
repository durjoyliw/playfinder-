export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d0d",
        color: "#ffffff",
      }}
    >
      {children}
    </div>
  );
}
