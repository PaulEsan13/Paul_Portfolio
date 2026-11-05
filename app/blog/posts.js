// Blog posts — newest first. Add a post by copying one of the objects below.
// type: "article" (writing, images) or "video" (a video with notes).
// body: a list of paragraphs (strings), images { img: "/blog/your-image.webp", caption: "" },
//       headings { h: "Heading" } or videos { video: "/blog/clip.mp4" }.
// Put images/videos for posts in /public/blog/.
export const posts = [
  {
    slug: "ashcorp-showreel",
    type: "video",
    title: "AshCorp: One Source, Many Worlds — the showreel",
    date: "2026-11-05",
    cover: "/video/showreel-poster.jpg",
    video: "/video/showreel.mp4",
    excerpt: "The motion reel for the Ashcorp Group identity: the house that builds brands.",
    body: [
      "Ashcorp is a creative holding company and brand incubator, the operational and strategic home behind a growing family of fashion, beauty, and lifestyle brands. It is not a fashion house. It is the house that builds them.",
      { link: "/work/ashcorp", label: "Read the full case study →" },
    ],
  },
];

export const getPost = (slug) => posts.find((p) => p.slug === slug);
export const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
