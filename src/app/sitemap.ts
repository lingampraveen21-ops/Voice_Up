export default function sitemap() {
    const baseUrl = 'https://voiceup.ai';

    // Basic routes
    const routes = ['', '/login', '/signup', '/privacy', '/terms'].flatMap(
        (route) => [
            {
                url: `${baseUrl}/en${route}`,
                lastModified: new Date(),
            },
            {
                url: `${baseUrl}/hi${route}`,
                lastModified: new Date(),
            },
            {
                url: `${baseUrl}/es${route}`,
                lastModified: new Date(),
            }
        ]
    );

    return routes;
}
