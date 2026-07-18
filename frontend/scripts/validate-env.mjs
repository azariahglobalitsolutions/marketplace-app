const required = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_SITE_URL"];

if (process.env.NODE_ENV === "production") {
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    const message = `${missing.join(", ")} must be set for production builds.`;
    if (process.env.CI || process.env.RENDER) {
      throw new Error(message);
    }

    console.warn(`[validate-env] ${message}`);
  }
}
