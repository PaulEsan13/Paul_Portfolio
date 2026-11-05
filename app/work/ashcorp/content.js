// AshCorp case study — order and text follow the Behance project
// https://www.behance.net/gallery/254294061/Ashcorp-Group-Brand-Identity
const W = (n, ratio = "16/9") => ({ type: "img", src: `/work/ashcorp/${String(n).padStart(2, "0")}.webp`, ratio });
const P = (n) => W(n, "8/9");
const grid = (...items) => ({ type: "grid", items });

export const project = {
  slug: "ashcorp",
  title: "Ashcorp Group",
  subtitle: "One Source, Many Worlds",
  category: "Brand Identity",
  thanks: "Thanks for watching. Ashcorp Group — the house that builds brands.",
  year: "2026",
  role: "Brand strategy, identity, art direction, motion",
  tools: "Illustrator, After Effects, Figma",
  fields: "Branding · Art Direction · Graphic Design",
  behance: "https://www.behance.net/gallery/254294061/Ashcorp-Group-Brand-Identity",
  next: { name: "Zentai", href: "/work", note: "Coming soon" },
};

export const sections = [
  {
    id: "overview", label: "Overview",
    blocks: [
      { type: "video", src: "/video/showreel.mp4", poster: "/video/showreel-poster.jpg" },
      W(0),
      { type: "lead", title: "The house that builds them", text: "Ashcorp is a creative holding company and brand incubator, the operational and strategic home behind a growing family of fashion, beauty, and lifestyle brands. Where its child brands face the world directly, Ashcorp works behind the scenes: building infrastructure, shaping identity, and holding the ecosystem together. It is not a fashion house. It is the house that builds them." },
    ],
  },
  {
    id: "challenge", label: "Challenge",
    blocks: [
      { type: "text", title: "Challenge", body: [
        "For years, AshCorp read as a fashion house. The labels people knew; Ashluxe & Ashluxury, the streetwear, the retail names, were loud enough to define the whole company. That was the story the market had settled on, and it wasn't wrong, exactly. It was just incomplete.",
        "We look closer and the picture shifts. Skincare. Fragrance. Logistics, Lifestyle. Brands with nothing to do with fashion at all, sitting quietly under the same roof. Ashcorp wasn't a fashion company with a few side ventures. It was something else entirely, and nobody had said so yet.",
      ] },
    ],
  },
  {
    id: "strategy", label: "Strategy",
    blocks: [
      { type: "text", title: "A Fashion House?", body: [
        "Is AshCorp a fashion house, or something the fashion house was mistaken for?",
        "That was the real brief. Our answer: reframe the whole premise. Ashcorp isn't in the business of clothing, skincare, or fragrance, it's in the business of starting businesses. Every label underneath it, fashion or otherwise, is evidence of the same instinct: build something, let it stand on its own.",
        "We anchored the new identity in that idea, Ashcorp as source, not category. One Source, Many Worlds. The Home of great brands. Rooted. Growing. Holding. Language built to carry origin, not product, because that's the one thing every AshCorp brand actually has in common.",
      ] },
      W(1, "4/3"),
      W(2),
    ],
  },
  {
    id: "identity", label: "Identity",
    blocks: [
      { type: "text", title: "Mark", body: [
        "The logo had to do the same work the strategy did: stop reading as fashion, start reading as source.",
        "The mark was built around a rooftop. A house form, distilled down to its simplest silhouette, because a house is the oldest shorthand we have for shelter, for origin, for the place you come from before you go out into the world. Every brand under AshCorp: (Ashluxe, Ahluxury, 234 Labs: fashion), (Zentaii: skincare), (Zafira: fragrance), (Ash Logistics: logistics), (Athclub: lifestyle) started somewhere. This is that somewhere, given a shape.",
        "It's not a literal house. It's a suggestion of one, a form that reads as source, as shelter, as home, without ever tipping into cliché. The kind of mark that, once you know the story, you can't unsee it.",
      ] },
      W(3), W(4), W(5), W(6),
      { type: "text", title: "Typography & Colour", body: [
        "The Typography holds the other end of that tension. Where colour brings warmth and energy, the type brings structure and authority, the signal that behind all the creativity, there is a company that takes its work seriously and operates at the highest standard.",
        "The Colour is doing more than holding the palette together. It is a deliberate reflection of the people inside the company. Ashcorp is a holding company, yes but the people who work there, and across every brand it has built, are intentionally young, vibrant, creative, and innovative. The energy of the palette speaks directly to them. It communicates that this is not a cold corporate institution. It is a place built by and for people who are alive to what they are doing.",
      ] },
      W(7), W(8), W(9), W(10), W(11), W(12),
      { type: "text", title: "Illustration Style; The Portal Concept", body: [
        "The illustration language for Ashcorp is built around a single idea: one source, many worlds. At the centre of every composition sits an ellipse, a portal. Flat, calm, and complete in itself. From it, different shapes emerge: cylindrical, rectangular, spherical, angular, each one distinct, each one moving outward as if being born from the same origin point. The ellipse is Ashcorp. The shapes are its brands.",
        "What makes the concept deliberate is the variety of forms emerging from that single source. No two shapes are the same, because no two brands are the same. Each carries its own geometry, its own weight, its own direction. They share a source but not a destination. They share an origin but not an identity. That tension, unity without uniformity, is exactly what the illustration is designed to communicate.",
        "The visual style sits at the intersection of 2D and 3D. Compositions are rooted in flat, illustrative logic, but rendered with depth, shadow, and dimension that give each piece the illusion of space. You sense volume where there is none. You feel distance in something that is technically flat. That push and pull between what something appears to be and what it actually is mirrors the Ashcorp story itself: a company that operates quietly in the background, but whose influence shapes everything visible in front of it.",
        "Colour is vibrant and deliberate, drawn from the Ashcorp palette, but alive in the way illustration allows colour to be. Where the brand system is restrained, the illustration world breathes.",
      ] },
      W(13), W(14), W(15), W(16), W(17), W(18), W(19), W(20), W(21),
    ],
  },
  {
    id: "application", label: "Application",
    blocks: [
      { type: "text", title: "Application", body: [
        "The Ashcorp brand identity was built to live, not just exist in a guidelines document. Across every application, the system holds together with the same quiet confidence that shaped it from the start: rooted in Forest Green, activated by Sunset Yellow and Roy Blue, and anchored always by the Ashcorp mark.",
        "The visual application spans stationery, social media, digital advertising, and brand collateral, each touchpoint carrying the same strategic intention. The wordmark dominates where authority is needed. The logomark holds its own where space is tight. The colour system shifts and breathes across formats without ever losing coherence, green grounding, yellow energising, blue expanding, crimson punctuating.",
        "The imagery closes the loop. Across every application, the photography features the kind of people who actually exist within the Ashcorp world, young, confident, expressive, representing not just Ashcorp itself but the full family of brands it has created and continues to build. Real faces. Real energy. The brand made human.",
        "And running through all of it is the illustration system, the portal, the shapes emerging, the depth that binds the colour, type, and imagery into a single visual language that says, clearly and without apology: one source, many worlds.",
      ] },
      W(22), W(23), W(24), W(25), W(26), W(27), W(28), W(29), W(30), W(31),
      grid(P(32), P(33), P(34)),
      W(35), W(36), W(37),
      grid(P(38), P(39)),
      W(40), W(41), W(42),
      grid(P(43), P(44)),
      W(45),
      W(46, "32/9"),
    ],
  },
];
