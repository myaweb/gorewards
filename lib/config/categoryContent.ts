export interface CategoryBottomContent {
  howToChoose: {
    heading: string
    paragraphs: string[]
  }
  thingsToConsider: { title: string; body: string }[]
  faq: { q: string; a: string }[]
}

export const CATEGORY_BOTTOM_CONTENT: Record<string, CategoryBottomContent> = {
  groceries: {
    howToChoose: {
      heading: "How to Pick the Right Grocery Credit Card",
      paragraphs: [
        "Groceries are one of the biggest monthly expenses for most Canadian households — and one of the easiest categories to earn serious rewards on. The difference between a 1% and a 6% earn rate on $800/month in grocery spending works out to roughly $480 extra per year. That's real money.",
        "The first thing to look at is where you actually shop. Some cards offer elevated rates only at specific chains — PC Financial cards shine at Loblaws-owned stores, while the Scotiabank Gold Amex earns 6x at any grocery store in Canada. If you split your shopping between multiple stores, a card with a broad grocery definition wins every time.",
        "Don't ignore the annual fee math. A card charging $120/year needs to earn you at least that much in extra rewards before it's worth it. Run the numbers with your actual monthly spend — most people are surprised how quickly a premium card pays for itself.",
      ],
    },
    thingsToConsider: [
      { title: "Earn rate at your store", body: "Check whether the card's bonus applies to your specific grocery chain. Some cards exclude warehouse stores like Costco or specialty grocers." },
      { title: "Annual fee vs. rewards", body: "A $0 fee card at 3% often beats a $120 fee card at 4% unless you spend over $1,000/month on groceries." },
      { title: "Point redemption value", body: "Points programs vary wildly. Aeroplan points can be worth 1.5–2¢ each when redeemed for flights, while some bank points are worth just 0.5¢ as statement credits." },
      { title: "Supplementary cards", body: "If your household has multiple shoppers, adding a free supplementary card lets everyone earn on the same account." },
    ],
    faq: [
      { q: "Which credit card gives the most cash back on groceries in Canada?", a: "The Scotiabank Gold American Express currently offers 6x Scene+ points on groceries at any store in Canada, which translates to roughly 6% back when redeemed for travel or statement credits. The BMO CashBack World Elite Mastercard offers 5% cash back but only at eligible grocery stores." },
      { q: "Do grocery rewards cards work at Costco?", a: "Most Visa and Mastercard grocery cards work at Costco, but the bonus category may not apply since Costco is classified as a warehouse club, not a grocery store. Check your card's merchant category definitions before assuming you'll earn bonus points there." },
      { q: "Is it worth paying an annual fee for a grocery rewards card?", a: "It depends on your monthly spend. If you spend $600+ per month on groceries, a premium card with a $120 annual fee will almost always pay for itself through higher earn rates and welcome bonuses. Below that threshold, a no-fee card with a solid base rate is usually the smarter pick." },
      { q: "Can I use multiple cards to maximize grocery rewards?", a: "Yes — many Canadians use a dedicated grocery card for supermarket purchases and a flat-rate card for everything else. Just make sure the mental overhead of managing two cards is worth the extra rewards." },
    ],
  },

  gas: {
    howToChoose: {
      heading: "How to Find the Best Gas Credit Card for Your Driving Habits",
      paragraphs: [
        "Gas is one of those categories where the right card can make a noticeable difference — especially if you commute regularly or drive for work. At $0.04 back per litre difference between cards, someone filling up twice a week will see a meaningful gap by year end.",
        "The key question is whether you fill up at a specific station chain or wherever is cheapest. Cards tied to Petro-Canada or Shell offer extra perks at those stations, but if you're not loyal to a brand, a card that earns bonus points at any gas station gives you more flexibility.",
        "Also worth noting: some cards cap their gas bonus at a certain annual spend. If you drive a lot, check whether the elevated rate applies to all your gas purchases or just the first $5,000–$10,000 per year.",
      ],
    },
    thingsToConsider: [
      { title: "Station loyalty vs. flexibility", body: "Co-branded gas cards often offer the highest rates at specific stations but earn less elsewhere. General-purpose cards with gas bonuses work anywhere." },
      { title: "Spending caps", body: "Some cards cap bonus earnings at $5,000–$10,000/year in the gas category. Heavy drivers should check this before applying." },
      { title: "EV charging", body: "If you drive an electric vehicle, look for cards that include EV charging stations in their gas/transportation category — several Canadian cards now do." },
      { title: "Combining with loyalty programs", body: "Pairing a gas rewards card with a Petro-Points or Air Miles card at the pump can stack rewards from two programs simultaneously." },
    ],
    faq: [
      { q: "What is the best credit card for gas in Canada?", a: "The BMO Eclipse Visa Infinite and CIBC Dividend Visa Infinite both offer 4–5% back on gas. For flexibility across all stations, the Scotiabank Gold Amex earns 3x Scene+ points at any gas station in Canada." },
      { q: "Do gas credit card bonuses apply to EV charging?", a: "Increasingly yes. Cards like the RBC ION Visa and BMO CashBack World Elite now include EV charging stations in their transportation/gas category. Always verify with the issuer before assuming." },
      { q: "Can I earn rewards on gas and a loyalty program at the same time?", a: "Yes. You can swipe your rewards credit card for payment and scan your Petro-Points or Air Miles card separately. Both programs track independently, so you earn from both on the same transaction." },
    ],
  },

  dining: {
    howToChoose: {
      heading: "Choosing a Dining Credit Card That Actually Fits How You Eat Out",
      paragraphs: [
        "Dining rewards cards are straightforward in theory — use the card at restaurants, earn more points. In practice, the definition of 'dining' varies a lot between issuers. Some cards include food delivery apps like DoorDash and Uber Eats; others don't. Some count coffee shops; others require a sit-down restaurant.",
        "If you order delivery regularly, this distinction matters. The American Express Cobalt Card, for example, earns 5x on all food and drink purchases including delivery — making it one of the strongest dining cards in Canada for people who eat at home as much as out.",
        "For frequent restaurant-goers, look beyond the earn rate. Cards with dining perks like priority reservations, concierge services, or restaurant credits can add value that doesn't show up in the points math.",
      ],
    },
    thingsToConsider: [
      { title: "Delivery app coverage", body: "Check whether your card counts Uber Eats, DoorDash, and Skip the Dishes as dining. This can double your effective dining spend if you order in regularly." },
      { title: "International dining", body: "If you travel and dine out abroad, look for a card with no foreign transaction fees alongside strong dining earn rates." },
      { title: "Bar and café spending", body: "Some cards include bars and coffee shops in the dining category; others restrict it to full-service restaurants. Know what counts before you apply." },
      { title: "Redemption flexibility", body: "High dining earn rates are only valuable if you can redeem points for something you actually want. Flexible points like Amex Membership Rewards or Scotia Scene+ tend to offer the best redemption options." },
    ],
    faq: [
      { q: "What is the best credit card for restaurants in Canada?", a: "The American Express Cobalt Card earns 5x Membership Rewards points on all food and drink purchases, including restaurants, bars, cafés, and food delivery. The Scotiabank Gold Amex and National Bank World Elite Mastercard also offer strong dining rates at 5x and 5x respectively." },
      { q: "Does dining include food delivery apps?", a: "It depends on the card. Amex Cobalt includes delivery apps. Scotiabank Gold Amex includes food delivery. TD and CIBC Aeroplan cards typically do not include third-party delivery apps in their dining category." },
      { q: "Should I get a dining card if I mostly order takeout?", a: "Yes — as long as your card counts delivery apps as dining. The Amex Cobalt is particularly strong here since it earns 5x on any food or drink purchase regardless of how it's ordered." },
    ],
  },

  travel: {
    howToChoose: {
      heading: "What to Look for in a Travel Credit Card — Beyond the Points",
      paragraphs: [
        "Travel credit cards are the most marketed category in Canadian personal finance, and for good reason — the welcome bonuses alone can be worth $500–$1,000 in flights. But the earn rate on travel purchases is just one piece of the puzzle.",
        "The real differentiators are the perks that don't show up in a points calculator: airport lounge access, travel insurance coverage, no foreign transaction fees, and trip cancellation protection. A card with a slightly lower earn rate but comprehensive travel insurance can save you hundreds on a single trip.",
        "Think about how you book travel. Cards tied to specific programs like Aeroplan or Avion work best if you fly Air Canada or redeem through their partners. If you prefer booking directly or through any airline, a flexible points card like Amex Membership Rewards or Scotia Scene+ gives you more options.",
      ],
    },
    thingsToConsider: [
      { title: "Lounge access", body: "Premium travel cards often include Priority Pass or Visa Infinite Privilege lounge access. If you travel frequently, this alone can justify a $400+ annual fee." },
      { title: "Foreign transaction fees", body: "Most Canadian credit cards charge 2.5% on foreign currency purchases. Cards like the Scotiabank Passport Visa Infinite waive this fee — a significant saving for international travellers." },
      { title: "Travel insurance depth", body: "Not all travel insurance is equal. Check the coverage limits for trip cancellation, medical emergencies, and flight delays. Some cards cap medical coverage at $1M; others at $5M." },
      { title: "Point transfer partners", body: "Flexible points programs like Amex Membership Rewards can transfer to multiple airline and hotel programs, often at a 1:1 ratio. This flexibility can dramatically increase the value of your points." },
    ],
    faq: [
      { q: "What is the best travel credit card in Canada?", a: "It depends on your travel style. For Air Canada flyers, the TD Aeroplan Visa Infinite Privilege or CIBC Aeroplan Visa Infinite are top picks. For flexible travel, the American Express Platinum Card or Scotiabank Passport Visa Infinite offer strong earn rates and premium perks." },
      { q: "Which Canadian credit cards have no foreign transaction fees?", a: "The Scotiabank Passport Visa Infinite, Home Trust Preferred Visa, and Rogers World Elite Mastercard all waive foreign transaction fees. This saves you 2.5% on every purchase made in a foreign currency." },
      { q: "Is a $600 annual fee travel card worth it?", a: "For frequent travellers, often yes. A card like the Amex Platinum charges $799/year but includes lounge access, travel credits, and a welcome bonus that can offset the fee entirely in year one. Run the numbers based on how often you use the perks." },
      { q: "Can I use travel points for hotels and car rentals, not just flights?", a: "Yes. Most flexible points programs — Amex Membership Rewards, Scotia Scene+, BMO Rewards — allow redemptions for hotels, car rentals, and vacation packages, not just flights." },
    ],
  },

  bills: {
    howToChoose: {
      heading: "Earning Rewards on Bills You're Already Paying",
      paragraphs: [
        "Recurring bills are one of the most underrated earning categories. Your phone plan, internet, streaming subscriptions, insurance premiums, and utility payments go out every month whether you think about them or not — you might as well earn rewards on them.",
        "The Scotiabank Momentum Visa Infinite is the standout here, earning 4% cash back on recurring bills and subscriptions. For someone paying $400/month in recurring charges, that's $192/year in cash back from bills alone.",
        "One thing to watch: not all recurring charges qualify. Some cards exclude insurance payments, government bills, or mortgage payments from the bonus category. Check the fine print before assuming your entire monthly bill stack will earn at the elevated rate.",
      ],
    },
    thingsToConsider: [
      { title: "What counts as recurring", body: "Most cards include streaming services, phone plans, internet, and gym memberships. Insurance and utility payments vary by issuer — always verify." },
      { title: "Pre-authorized payments", body: "The charge must typically be set up as a pre-authorized payment (PAP) to qualify for the bonus rate. One-time bill payments usually earn at the base rate." },
      { title: "Stacking with other categories", body: "A card strong on recurring bills may be weak on groceries or gas. Consider whether a single card covers your top categories or whether a two-card setup makes more sense." },
    ],
    faq: [
      { q: "Which credit card earns the most on recurring bills in Canada?", a: "The Scotiabank Momentum Visa Infinite earns 4% cash back on recurring bill payments and subscriptions, making it the top pick in this category. The TD Cash Back Visa Infinite earns 3% on recurring payments." },
      { q: "Do streaming services like Netflix count as recurring bills?", a: "Yes, for most cards that have a recurring bills category. Netflix, Spotify, Disney+, and similar subscriptions are typically included. Some cards also count gaming subscriptions like Xbox Game Pass." },
      { q: "Does my mortgage payment earn bonus rewards?", a: "Generally no. Mortgage payments are excluded from the recurring bills bonus category on most Canadian credit cards. The bonus typically applies to subscription-type charges, not loan payments." },
    ],
  },

  entertainment: {
    howToChoose: {
      heading: "Getting More From Your Entertainment Spending",
      paragraphs: [
        "Entertainment is a broad category — it can mean movie tickets, concerts, sporting events, streaming services, or gaming. The cards that perform best here tend to define it broadly, which is what you want.",
        "The BMO Eclipse Visa Infinite and Scotiabank Scene+ Visa both earn elevated rates on entertainment, but they serve different audiences. The Scene+ card is particularly strong for Cineplex moviegoers, offering 5x points at Cineplex theatres. The Eclipse card earns 5x on a wider range of entertainment purchases.",
        "If you're a heavy streamer rather than an out-of-home entertainment spender, look for cards that include digital subscriptions in their entertainment category — not all of them do.",
      ],
    },
    thingsToConsider: [
      { title: "In-person vs. digital", body: "Some cards define entertainment as live events and theatres only. Others include streaming, gaming, and digital purchases. Know which type of entertainment you spend most on." },
      { title: "Cineplex loyalty", body: "If you go to movies regularly, the Scotiabank Scene+ Visa earns 5x at Cineplex and comes with no annual fee — hard to beat for movie fans." },
      { title: "Concert and event tickets", body: "Premium cards sometimes include entertainment perks like presale access or concierge ticket booking, which can be valuable for high-demand events." },
    ],
    faq: [
      { q: "What credit card is best for movies and entertainment in Canada?", a: "The Scotiabank Scene+ Visa earns 5x points at Cineplex theatres with no annual fee. For broader entertainment spending, the BMO Eclipse Visa Infinite earns 5x on entertainment purchases including events and digital content." },
      { q: "Do entertainment credit cards include streaming services?", a: "Some do, some don't. The BMO Eclipse Visa Infinite includes streaming in its entertainment category. The Scotiabank Scene+ Visa focuses more on Cineplex and in-person entertainment. Check the card's category definitions carefully." },
    ],
  },

  shopping: {
    howToChoose: {
      heading: "Maximizing Rewards on Retail and Online Shopping",
      paragraphs: [
        "Shopping rewards cards work best when they align with where you actually spend. Store-affiliated cards like the PC Mastercard or Canadian Tire Triangle Mastercard offer exceptional rates at their own stores but earn little elsewhere. General-purpose cards with shopping bonuses give you more flexibility.",
        "Online shopping has changed the equation significantly. Cards that earn bonus points on all purchases — including Amazon, online retailers, and marketplace apps — are increasingly valuable as more spending moves online.",
        "The Tangerine Money-Back card is worth mentioning here: you choose your own bonus categories, and shopping is one of the options. If retail is your biggest spend category, this flexibility lets you optimize your earn rate without being locked into a specific store.",
      ],
    },
    thingsToConsider: [
      { title: "Store-specific vs. general", body: "Co-branded retail cards earn the most at their affiliated stores but little elsewhere. A general card with a shopping bonus is usually more versatile." },
      { title: "Online vs. in-store", body: "Check whether the card's shopping bonus applies to online purchases. Some cards define shopping as physical retail only." },
      { title: "Purchase protection", body: "Many shopping-focused cards include purchase protection and extended warranty coverage — useful for electronics and appliances." },
    ],
    faq: [
      { q: "What is the best credit card for online shopping in Canada?", a: "The Tangerine Money-Back Credit Card lets you choose shopping as a bonus category, earning 2% cash back. The PC World Elite Mastercard earns 3x PC Optimum points at Loblaws-affiliated stores and online at PC Express." },
      { q: "Do shopping rewards cards work on Amazon Canada?", a: "Most general-purpose rewards cards earn their base rate on Amazon purchases. Few Canadian cards offer a specific Amazon bonus category, though some flat-rate cards like the Rogers World Elite Mastercard earn 1.5% on all purchases including Amazon." },
    ],
  },

  student: {
    howToChoose: {
      heading: "Your First Credit Card: What Actually Matters as a Student",
      paragraphs: [
        "Getting your first credit card as a student is less about maximizing rewards and more about building a credit history without getting into trouble. That said, there's no reason you can't do both — several Canadian cards designed for students offer genuine rewards with no annual fee and relaxed income requirements.",
        "The most important thing is to pick a card you'll actually pay off in full each month. The interest rate on any credit card — typically 19.99–22.99% — will wipe out any rewards you earn if you carry a balance. Treat it like a debit card: only spend what you have.",
        "For international students, the Home Trust Preferred Visa is worth a close look — it has no annual fee, no foreign transaction fees, and doesn't require a Canadian credit history to apply. For domestic students, the Scotiabank Scene+ Visa and Tangerine Money-Back card are consistently recommended for their simplicity and solid earn rates.",
      ],
    },
    thingsToConsider: [
      { title: "No annual fee", body: "As a student, start with a no-fee card. There's no reason to pay an annual fee until you're earning enough to justify premium card benefits." },
      { title: "Low or no income requirement", body: "Many student cards don't require proof of income or have very low minimums. Check the eligibility requirements before applying." },
      { title: "Credit limit", body: "Student cards typically start with low credit limits ($500–$2,000). This is actually helpful — it limits how much you can overspend while you're building habits." },
      { title: "Credit building", body: "Pay your balance in full every month and keep your utilization below 30% of your limit. These two habits will build a strong credit score faster than anything else." },
    ],
    faq: [
      { q: "Can international students get a credit card in Canada?", a: "Yes. The Home Trust Preferred Visa is one of the most accessible options for newcomers and international students — it doesn't require a Canadian credit history and has no annual fee or foreign transaction fees." },
      { q: "What credit score do I need for a student credit card?", a: "Most student cards are designed for people with limited or no credit history. You don't need a high score — you just need to be a Canadian resident (or student visa holder) and meet the basic income requirements, which are often $0 for student cards." },
      { q: "Should I get a secured or unsecured student credit card?", a: "Start with an unsecured card if you qualify — you won't need to put up a deposit. If you're declined, a secured card (where you deposit $500–$1,000 as collateral) is a solid backup for building credit." },
    ],
  },

  business: {
    howToChoose: {
      heading: "Choosing a Business Credit Card That Works as Hard as You Do",
      paragraphs: [
        "Business credit cards serve a different purpose than personal cards. Beyond rewards, they help you separate business and personal expenses, simplify tax time, and often come with higher credit limits and employee card options.",
        "The best business card for you depends on where your business spends most. A consulting firm with heavy travel and dining expenses will get more value from the Amex Platinum or Scotiabank Passport than a retail business that spends primarily on inventory and supplies.",
        "Don't overlook the administrative benefits: expense tracking, year-end summaries, and accounting software integrations can save hours of bookkeeping. Some premium business cards also offer purchase protection and extended warranties on business equipment purchases.",
      ],
    },
    thingsToConsider: [
      { title: "Employee cards", body: "If you have staff who make purchases, look for cards that offer free or low-cost supplementary cards with individual spending limits." },
      { title: "Expense categories", body: "Map your top business expense categories to the card's bonus categories. A card that earns 3x on travel is only valuable if travel is actually a significant business expense." },
      { title: "Cash flow", body: "Some business cards offer extended payment terms or higher credit limits that can help with cash flow management between client payments." },
      { title: "Tax deductibility", body: "Annual fees on business credit cards are generally tax-deductible as a business expense in Canada. Keep your statements for your accountant." },
    ],
    faq: [
      { q: "Do I need a registered business to get a business credit card in Canada?", a: "Not always. Many issuers will approve a business credit card for sole proprietors and freelancers using their personal income and SIN. You don't need to be incorporated." },
      { q: "What is the best business credit card in Canada?", a: "The American Express Business Platinum and Scotiabank Passport Visa Infinite Business are consistently rated at the top for premium business travel. For everyday business spending, the Amex Business Gold Rewards Card offers strong earn rates across multiple categories." },
      { q: "Can I use a personal credit card for business expenses?", a: "Technically yes, but it's not recommended. Mixing personal and business expenses complicates bookkeeping, can create issues at tax time, and means you miss out on business-specific perks and higher credit limits." },
    ],
  },

  "signup-bonus": {
    howToChoose: {
      heading: "How to Actually Get Value From a Credit Card Welcome Bonus",
      paragraphs: [
        "Welcome bonuses are the fastest way to accumulate a large number of points — but they come with conditions. Most require you to spend a minimum amount (typically $1,500–$5,000) within the first 3–6 months to unlock the full bonus. Before applying, make sure you can hit that threshold with normal spending, not by manufacturing purchases.",
        "The headline bonus number can be misleading. 60,000 Aeroplan points sounds impressive, but the value depends entirely on how you redeem them. Used for a business class flight, those points might be worth $1,500+. Redeemed for merchandise, they might be worth $300. Always calculate the value based on your intended redemption.",
        "Timing matters too. Many issuers run elevated welcome offers at certain times of year — the Amex Platinum, for example, periodically offers 100,000+ points versus its standard 70,000. Waiting a few weeks for a better offer can be worth it.",
      ],
    },
    thingsToConsider: [
      { title: "Minimum spend requirement", body: "Calculate whether you can hit the minimum spend with regular purchases. Avoid overspending just to earn a bonus — the interest charges will cost more than the bonus is worth." },
      { title: "Annual fee in year one", body: "Many cards waive the annual fee for the first year. Factor this in when calculating your net first-year value: bonus value minus annual fee (if applicable)." },
      { title: "One bonus per lifetime", body: "Most Canadian issuers have a 'once per lifetime' rule on welcome bonuses. If you've held the card before, you likely won't qualify for the bonus again." },
      { title: "Redemption plan", body: "Have a plan for your points before you apply. Points sitting unused for years lose value as programs devalue their currencies." },
    ],
    faq: [
      { q: "What is the highest credit card welcome bonus in Canada?", a: "The American Express Platinum Card regularly offers 70,000–100,000 Membership Rewards points as a welcome bonus, worth $700–$1,400+ depending on redemption. The TD Aeroplan Visa Infinite Privilege and CIBC Aeroplan Visa Infinite also offer competitive bonuses of 50,000–75,000 Aeroplan points." },
      { q: "How long do I have to earn the welcome bonus?", a: "Most cards give you 3–6 months to meet the minimum spend requirement. The clock starts from account opening, not from when you receive the card. Check your specific card's terms." },
      { q: "Can I get a welcome bonus if I've had the card before?", a: "Generally no. Most Canadian issuers have a once-per-lifetime rule. American Express is particularly strict about this. If you cancelled a card more than 2 years ago, some issuers may make exceptions — but don't count on it." },
      { q: "Is it worth applying for a card just for the welcome bonus?", a: "It can be, especially for high-value bonuses on cards with waived first-year fees. Just make sure you can meet the minimum spend naturally, and have a plan to either keep the card (if it has ongoing value) or cancel before the second-year fee hits." },
    ],
  },
}
