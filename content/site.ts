// Every word and link on the site lives here. Sourced from usopennetball.com (Nov 7, 2026).

export const EVENT = {
  name: "U.S. Open Netball Championships®",
  shortName: "U.S. Open",
  year: 2026,
  tagline: "Bridging Cultures, Communities & Countries",
  datesLabel: "November 6–8, 2026",
  city: "Las Vegas, Nevada",
  timeZone: "America/Los_Angeles",
  applyHref: "mailto:usopen@netballamerica.com?subject=U.S.%20Open%20Invitation%20Request",
  email: "usopen@netballamerica.com",
  donateHref: "https://www.paypal.com/donate/?hosted_button_id=4BQYFDZCY4LPW",
  newsletterHref: "https://lp.constantcontactpages.com/sl/p1lTL2M",
};

// YouTube IDs. Override any of them in Vercel → Settings → Environment Variables without a redeploy of code.
export const STREAMS = {
  day1: process.env.NEXT_PUBLIC_STREAM_DAY1 || "sgTG8qF8O-Q", // "Day One — U.S. Open Netball Championships® 2026"
  day2: process.env.NEXT_PUBLIC_STREAM_DAY2 || "", // set on Sunday morning
  replaysPlaylist: "PLPrq7rIyRyfJMKg_uGk03hfteVsN6rOEU", // 2025 broadcast playlist
  invitation: "kagSnDZSgqk", // "Invitation to the 2026 U.S. Open"
  meetTheTeams: "XsupSCREpR0", // "Meet your 2026 U.S. Open teams!"
  testimonial: "LzwknsyOnos", // "2025 U.S. Open Testimonial"
  channel: "https://www.youtube.com/user/NetballUSA",
};

// Broadcast windows (Pacific). Used for the LIVE badge and the default tab.
export const DAYS = [
  { id: "fri", label: "Fri", title: "Clinics & meetings", date: "2026-11-06", detail: "Afternoon meetings, clinics and training" },
  { id: "sat", label: "Sat", title: "Day One", date: "2026-11-07", detail: "Games begin at 8:20 AM", live: { from: "2026-11-07T08:00:00-08:00", to: "2026-11-07T19:00:00-08:00" } },
  { id: "sun", label: "Sun", title: "Finals Day", date: "2026-11-08", detail: "Tournament concludes at 3:00 PM", live: { from: "2026-11-08T07:30:00-08:00", to: "2026-11-08T16:00:00-08:00" } },
];

export const INTRO = {
  lead: "The USA's most prestigious and largest netball event. Since 2009, women's and mixed teams from around the world have come together every year, in a different city each time, to compete for the title of U.S. Open Netball Champions.",
  body: [
    "It is international sports diplomacy in action: building connections, celebrating diversity and creating friendships that extend far beyond the court.",
    "Netball is a grassroots sport in the USA, so the primary objective of the Championships is to develop American athletes, coaches and officials.",
  ],
};

export const STATS = [
  { value: "2009", label: "Held every year since" },
  { value: "25+", label: "U.S. states represented" },
  { value: "4,000", label: "Participants" },
  { value: "100K+", label: "Global livestream viewers" },
];

export const COUNTRIES = [
  "USA", "Australia", "Canada", "Fiji", "Hong Kong", "Jamaica", "Namibia", "New Zealand",
  "South Africa", "Trinidad & Tobago", "Uganda", "United Kingdom", "U.S. Virgin Islands",
];

export const VENUE = {
  name: "Henderson Sport & Social",
  address: ["3375 St Rose Pkwy", "Henderson, NV 89052"],
  mapHref: "https://www.google.com/maps/search/?api=1&query=Henderson+Sport+%26+Social+3375+St+Rose+Pkwy+Henderson+NV+89052",
  airport: "Harry Reid International Airport (LAS)",
  airportAddress: "5757 Wayne Newton Blvd, Las Vegas, NV 89119",
};

export const HOTELS = {
  intro: "Book through the official links. You'll save money, help reduce event costs and directly support the growth of netball. Every hotel is within a 20-minute drive of the venue and 15 minutes from the airport.",
  bookHref: "https://book.passkey.com/gt/221586210?gtid=e5cad91ca91880f1bb1f491d4fcb3711",
  options: [
    {
      name: "Sunset Station",
      role: "Premier event hotel",
      for: "Teams, family and friends",
      highlight: "No Las Vegas resort fee",
      highlightDetail: "Hotels on the Strip charge $50–$80 per night. Our link waives it, and you still get free Wi-Fi, the fitness center and the pool.",
      points: [
        "Hotel and all rooms recently renovated; every room non-smoking",
        "Deluxe King and Double Queen rooms at a heavily discounted group rate",
        "Ask for the Queen Petite Suite: more space, and it's actually cheaper",
        "Accessible and pet-friendly rooms available",
        "24-hour in-room dining",
        "Discounted team breakfast vouchers, available to buy in advance",
        "Strike Zone (72 bowling lanes), Regal cinema and Kids Quest supervised play for ages 30 months–12 years",
      ],
      bookHref: "https://book.passkey.com/gt/221586210?gtid=e5cad91ca91880f1bb1f491d4fcb3711",
    },
    {
      name: "Hampton Inn & Suites by Hilton",
      role: "Across the street from Sunset Station",
      for: "Teams, family and friends",
      soldOut: true,
      points: [
        "Free hot breakfast, Wi-Fi and parking",
        "Fitness center, outdoor pool and Jacuzzi",
        "Streaming entertainment",
      ],
      bookHref: "",
    },
  ],
};

export type Placing = { place: number | null; team: string; label?: string };
export type Division = { title: string; placings: Placing[] };

export const RESULTS_2025 = {
  host: "Round Rock, Texas",
  divisions: [
    { title: "Ladies Cup", placings: [
      { place: 1, team: "Santa Monica Heat", label: "Champions" },
      { place: 2, team: "Carolina Nets Tarheels" },
      { place: 3, team: "San Francisco Stars" },
      { place: 4, team: "Alberta Wild Roses" },
    ]},
    { title: "Mixed Cup", placings: [
      { place: 1, team: "Vancouver All Stars", label: "Champions" },
      { place: 2, team: "Thames Mavericks Typhoon" },
      { place: 3, team: "Thames Mavericks Tornado" },
      { place: 4, team: "Santa Monica Blaze" },
    ]},
    { title: "Ladies Bowl", placings: [
      { place: 1, team: "Texas State Bluebonnets", label: "Champions" },
      { place: 2, team: "Chicago Ladies" },
      { place: 3, team: "Denver Blizzard Avalanche" },
      { place: 4, team: "Santa Monica Suns" },
    ]},
    { title: "Mixed Bowl", placings: [
      { place: 1, team: "Chicago Mixed", label: "Champions" },
      { place: 2, team: "Vancouver Comets Ice" },
      { place: 3, team: "Vancouver Comets Fire" },
      { place: 4, team: "Alberta Panthers" },
    ]},
    { title: "Ladies Shield", placings: [
      { place: 1, team: "Carolina Nets Wolfpack", label: "Champions" },
      { place: 2, team: "Tampa Bay Panthers" },
      { place: 3, team: "Austin Retros" },
    ]},
    { title: "Mixed Shield", placings: [
      { place: 1, team: "Rising Stars", label: "Champions" },
      { place: 2, team: "San Francisco Stars" },
      { place: 3, team: "Woodlands Warriors" },
    ]},
  ] as Division[],
  awards: [
    { award: "Team Spirit Award", winner: "Vancouver All Stars" },
    { award: "Sigi Burger MVP (Male)", winner: "Gavin Watts, Vancouver All Stars" },
    { award: "Sigi Burger MVP (Female)", winner: "Hayley Zayas, San Francisco Stars" },
    { award: "Carol Alexander Memorial Umpire Award", winner: "Jeremy Wong" },
    { award: "Brian Anderson All-America Award", winner: "Immanuela Obisie-Orlu" },
  ],
};

export const RESULTS_2024: { ladies: Division[]; mixed: Division[] } = {
  ladies: [
    { title: "Cup", placings: [
      { place: 1, team: "Cheshire County", label: "Champions" },
      { place: 2, team: "Santa Monica Heat" },
      { place: 3, team: "San Francisco Stars" },
      { place: 4, team: "DC Dragons Fire" },
    ]},
    { title: "Bowl", placings: [
      { place: 1, team: "Carolina Nets", label: "Champions" },
      { place: 2, team: "Santa Rosa Netters" },
      { place: 3, team: "Chicago Netball" },
    ]},
    { title: "Shield", placings: [
      { place: 1, team: "Alberta Wild Roses", label: "Champions" },
      { place: 2, team: "DC Dragons Flames" },
      { place: 3, team: "MINC Yankees" },
    ]},
    { title: "Plate", placings: [
      { place: 1, team: "Katy Swifts", label: "Champions" },
    ]},
  ],
  mixed: [
    { title: "Cup", placings: [
      { place: 1, team: "Vancouver Comets Ice", label: "Champions" },
      { place: 2, team: "Alberta Panthers" },
      { place: 3, team: "Santa Monica Blaze" },
      { place: 4, team: "Chicago Netball" },
    ]},
    { title: "Bowl", placings: [
      { place: 1, team: "Vancouver Comets Fire", label: "Champions" },
      { place: 2, team: "Northern Stars" },
      { place: 3, team: "Santa Rosa Netters" },
      { place: 4, team: "Golden Tiki" },
    ]},
  ],
};

export const GET_INVOLVED = {
  volunteers: "Volunteers are the backbone of Netball America. We couldn't do any of this without people who give their time so freely. It's great experience if you want to work in not-for-profits or sport, or build skills in event management, social media, finance, IT and more. Projects come large and small, solo or in a team, at your own pace or on a set brief. We also take university interns.",
  international: "Every year we welcome a set number of volunteers, scorers and umpires from around the globe. You gain experience at a global sporting event in the USA, and our American volunteers, scorers and umpires learn from your international skills.",
};

export const MEDIA = {
  lead: "Past Championships topped Facebook Live's most-watched events, with more than 100,000 viewers tuning in from around the globe for a grassroots sport that is growing fast across the USA.",
  accreditation: "We welcome U.S. and international media, along with interns who want hands-on experience in interviewing, camera work and editing. All media must be accredited for the event.",
  coverage: [
    { title: "Fever assistant coach Karima Christmas-Kelly", outlet: "Yahoo Sports", href: "https://sports.yahoo.com/articles/fever-assistant-coach-karima-christmas-171300979.html" },
    { title: "Toco Police Youth Club 2nd at U.S. Open Netball", outlet: "Loop Trinidad & Tobago", href: "https://tt.loopnews.com/content/toco-police-youth-club-2nd-us-open-netball" },
    { title: "U.S. Open Netball Championships at Alario Center", outlet: "Crescent City Sports", href: "https://crescentcitysports.com/u-s-open-netball-championships-at-alario-center-november-3-5/" },
    { title: "U.S. Netball Championship", outlet: "Visit Jefferson Parish", href: "https://www.visitjeffersonparish.com/netball-championship/" },
    { title: "Netball Championships in Las Vegas", outlet: "Las Vegas Sun", href: "https://lasvegassun.com/photos/galleries/2012/nov/13/1111netball/" },
    { title: "Netball America in Las Vegas", outlet: "Las Vegas Weekly", href: "https://lasvegasweekly.com/photos/galleries/2012/nov/13/1111netball/" },
    { title: "Dallas to host the 2015 U.S. Open Netball Championships", outlet: "Netball America", href: "http://netballamerica.com/wp-content/uploads/PRESS-RELEASE-US-Open-2015.pdf" },
    { title: "2013 U.S. Open Netball Championships heads to Atlanta", outlet: "Netball America", href: "http://netballamerica.com/wp-content/uploads/2013-Calliduscloud-US-Open-press-release-10.30.13.pdf" },
    { title: "A record number of states at the USA national netball championships", outlet: "Free Press Release", href: "http://www.free-press-release.com/news-a-record-number-of-us-states-to-participate-in-the-usa-national-netball-championships-1319480240.html" },
    { title: "The U.S. opens its doors to international teams", outlet: "PR.com", href: "https://www.pr.com/press-release/452994" },
    { title: "Women Sports Report covers the U.S. Open in Nashville", outlet: "Women Sports Report", href: "http://www.womensportreport.com/usa-national-netball-championship-in/wn/14427" },
  ],
};

export const PARTNERS = {
  pitch: "Empower the future of women and girls in sport. Partner with a movement that unites culture, competition and education, and align your brand with purpose and progress.",
  innovation: "This year's event showcases AI-powered physical fitness testing by Talentlockr, a look at the future of athlete development and performance measurement.",
  audience: [
    "90% female participants aged 16–45",
    "4,000 participants",
    "1 million YouTube views",
    "100,000+ global broadcast viewers",
    "20,000-strong global mailing list",
  ],
  sponsorHref: "mailto:usopen@netballamerica.com?subject=U.S.%20Open%20Sponsorship",
  logos: [
    { name: "City of Henderson", file: "henderson.jpg", href: "https://www.cityofhenderson.com/" },
    { name: "Inferno", file: "inferno.jpg", href: "" },
    { name: "Vitoria", file: "vitoria.jpg", href: "https://www.vitoriasports.com/" },
    { name: "All-Star Executive Coaching", file: "all-star-executive-coaching.png", href: "https://www.allstarexecutivecoaching.com/" },
    { name: "Gilbert", file: "gilbert.png", href: "" },
    { name: "Netball Connect", file: "netball-connect.png", href: "" },
    { name: "America Josh", file: "america-josh.png", href: "https://americajosh.com/" },
    { name: "Australian Consulate-General Los Angeles", file: "australian-consulate-la.jpg", href: "" },
    { name: "Penfolds", file: "penfolds.png", href: "" },
    { name: "Talentlockr", file: "talentlockr.png", href: "" },
    { name: "Netball Singapore", file: "netball-singapore.jpg", href: "" },
    { name: "Skyline Productions", file: "skyline-productions.png", href: "" },
    { name: "Fuego Hard Alcoholic Ginger Beer", file: "fuego-hard.png", href: "" },
    { name: "The Codfather", file: "the-codfather.jpg", href: "" },
    { name: "Memory Artists Studios", file: "memory-artists.png", href: "" },
    { name: "Civil Air Patrol PCR-NV-802", file: "cap-pcr-nv-802.png", href: "" },
    { name: "Civil Air Patrol Nevada Wing", file: "cap-nevada-wing.png", href: "" },
    { name: "Patrick Duffy", file: "patrick-duffy.jpg", href: "" },
    { name: "Hawthorn & Moon Productions", file: "hawthorn-moon.png", href: "" },
    { name: "Henderson International School", file: "henderson-international-school.png", href: "" },
    { name: "The Medicare Store", file: "medicare-store.png", href: "" },
    { name: "The Recognition Shop", file: "recognition-shop.png", href: "" },
    { name: "The Verite Foundation", file: "verite-foundation.jpg", href: "" },
    { name: "Bradford Renaissance Portraits", file: "bradford.png", href: "" },
  ],
};

export const BAI = {
  text: "The U.S. Open supports the annual Be An Inspiration® (BAI) fundraiser, which champions minority youth, primarily girls, by tackling social inequities through the power of sport, with a focus on social-emotional learning, mental wellness, nutrition education and physical fitness.",
  href: "http://beaninspirationusa.org/",
};

export const SOCIAL = [
  { name: "Instagram", handle: "@netballamerica", href: "https://www.instagram.com/netballamerica/" },
  { name: "Facebook", handle: "U.S. Open", href: "https://www.facebook.com/USOpenNetballChampionships" },
  { name: "X", handle: "@usopennetball", href: "https://www.twitter.com/usopennetball" },
  { name: "YouTube", handle: "NetballUSA", href: "https://www.youtube.com/user/NetballUSA" },
  { name: "Facebook", handle: "Netball America", href: "https://www.facebook.com/NetballAmerica" },
  { name: "X", handle: "@netballamerica", href: "https://twitter.com/netballamerica" },
];

export const LEGAL = [
  { label: "Code of Conduct", href: "https://netballamerica.com/wp-content/uploads/Netball-America-Code-of-Conduct-Final.pdf" },
  { label: "Terms of Membership", href: "https://netballamerica.com/wp-content/uploads/Netball-America-Terms-of-Membership-Final.pdf" },
  { label: "Privacy Policy", href: "https://netballamerica.com/wp-content/uploads/Netball-America-Website-Privacy-Policy.pdf" },
];

export const NAV = [
  { label: "Watch", href: "/#watch" },
  { label: "Scores", href: "/#scores" },
  { label: "Event", href: "/#event" },
  { label: "Stay", href: "/#stay" },
  { label: "Results", href: "/results" },
  { label: "Partners", href: "/#partners" },
  { label: "Get involved", href: "/#get-involved" },
  { label: "Media", href: "/#media" },
];
