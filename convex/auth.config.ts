export default {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://YOUR_CLERK_DOMAIN",
            applicationID: "convex",
        },
    ]
};
