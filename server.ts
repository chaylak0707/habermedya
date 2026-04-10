app.use("/api", (req, res) => {
  const url = req.url;

  // CATEGORIES
  if (url.includes("categories")) {
    return res.json([
      {
        id: 1,
        name: "Genel",
        title: "Genel",
        slug: "genel",
        label: "Genel",
        description: "Genel kategori",
        isActive: 1,
      },
    ]);
  }

  // MENUS
  if (url.includes("menus")) {
    return res.json([
      {
        id: 1,
        name: "Ana Menü",
        title: "Ana Menü",
        slug: "ana-menu",
        label: "Ana Menü",
        items: [
          {
            id: 1,
            name: "Ana Sayfa",
            title: "Ana Sayfa",
            slug: "home",
            label: "Ana Sayfa",
          },
        ],
      },
    ]);
  }

  // ARTICLES
  if (url.includes("articles")) {
    return res.json([
      {
        id: 1,
        title: "Demo içerik",
        name: "Demo içerik",
        slug: "demo",
        label: "Demo içerik",
        content: "Test içerik",
      },
    ]);
  }

  // LOGIN / ME
  if (url.includes("login") || url.includes("me")) {
    return res.json({
      success: true,
      user: {
        id: 1,
        name: "Admin",
        username: "admin",
        role: "admin",
      },
    });
  }

  return res.json([]);
});
