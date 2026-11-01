// Verbatim Google Business Profile reviews — shared by the Testimonials
// section and the venue page. Plain .ts so server components can import it
// (data exported from a "use client" module arrives as a client reference).

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  handle: string;
};

// Verbatim from the Google Business Profile. Kept chronologically
// recent-first so fresh reviews anchor the wall.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "akshith",
    quote:
      "I've been playing here regularly and it's honestly one of the best pickleball courts around. The courts are well maintained, clean, and perfect for daily games. The lighting and overall setup make the experience really enjoyable. The best part is the friendly and supportive staff.",
    name: "Akshith Reddy",
    handle: "★★★★★ · Google review",
  },
  {
    id: "praveen",
    quote:
      "Amazing place to play pickleball! The courts are in great condition and very well maintained, which makes daily play smooth and enjoyable. The atmosphere here is very friendly and energetic.",
    name: "Salavath Praveen",
    handle: "★★★★★ · Google review",
  },
  {
    id: "halim",
    quote: "Great place to play pickleball! Clean court and good vibe.",
    name: "Halim Baig",
    handle: "★★★★★ · Google review",
  },
  {
    id: "junaid",
    quote: "Best pickle ball court in hyderabad ♥️",
    name: "Junaid Bhat",
    handle: "★★★★★ · Google review",
  },
  {
    id: "dasari",
    quote: "Best pickleball near me! Clean courts and great vibe.",
    name: "Dasari Raju",
    handle: "★★★★★ · Google review",
  },
  {
    id: "bgm",
    quote:
      "My experience on the pickleball court was awesome! It\u2019s a perfect mix of fitness and fun.",
    name: "BGM King",
    handle: "★★★★★ · Google review",
  },
  {
    id: "owas",
    quote:
      "Recently I visited this pickleball centre and honestly, it was an amazing experience! 🏓🔥 The court quality is really good, the environment is energetic, and everything about the place stands out.",
    name: "Ahanger Owas",
    handle: "★★★★★ · Google review",
  },
  {
    id: "shashank",
    quote: "Excellent maintenance and good place to play.",
    name: "Sai Shashank",
    handle: "★★★★★ · Local Guide",
  },
  {
    id: "abhishek",
    quote:
      "The courts are very good and the maintenance is also very good. The tournament organisation was amazing — me and my partner enjoyed a lot.",
    name: "Abhishek Yadav",
    handle: "★★★★★ · Google review",
  },
  {
    id: "jaswanth",
    quote:
      "The four courts are well-maintained, the equipment is good (offers good bounce unlike other courts around), and the hosts are friendly. Definitely the best spot in the area!",
    name: "Sai Jaswanth Seelam",
    handle: "★★★★★ · Google review",
  },
  {
    id: "varun",
    quote:
      "Well maintained courts and staff. Perfect place to chill out with the gang on weekends.",
    name: "Varun Creations",
    handle: "★★★★★ · Google review",
  },
  {
    id: "hari",
    quote:
      "Played pickleball for the first time — simple to learn, super fun, and surprisingly addictive!",
    name: "Hari Gopal",
    handle: "★★★★★ · Google review",
  },
  {
    id: "sundar",
    quote:
      "Best time to play is from 9:30pm onwards. Court is well maintained and spacious. Me along with my friends have been playing here since a month almost every Friday and Saturday night.",
    name: "Sundar Vummiti",
    handle: "★★★★★ · Google review",
  },
  {
    id: "ravirk",
    quote: "Wonderful atmosphere and well-maintained courts. Best pickleball court in this region.",
    name: "Ravi Kumar Dumpala",
    handle: "★★★★★ · Google review",
  },
  {
    id: "divya",
    quote: "Excellent place to de-stress ourselves!",
    name: "Divya",
    handle: "★★★★★ · Google review",
  },
  {
    id: "vanshika",
    quote:
      "Loved playing here! Big court, clean setup, and very beginner-friendly. Tried many courts but this one is reasonable and clean. Thinking of attending their weekend tournament too.",
    name: "Vanshika Gone",
    handle: "★★★★★ · Google review",
  },
  {
    id: "bhanu",
    quote:
      "I recently visited the Pickleball Central court near Uppal and totally loved it! The place is really big with nice courts and a great vibe. Staff are super friendly and helped us understand the game rules really well.",
    name: "Bhanu Chander",
    handle: "★★★★★ · Local Guide",
  },
  {
    id: "chaitanya",
    quote:
      "Excellent management! The parking area was well organized, and the staff received us with great courtesy.",
    name: "Chaitanya Gone",
    handle: "★★★★★ · Google review",
  },
  {
    id: "saikiran",
    quote:
      "Awesome pickleball court with great facilities and a fantastic community vibe. Perfect spot for players of all levels. Highly recommend!",
    name: "Saikiran Mathangi",
    handle: "★★★★★ · Google review",
  },
  {
    id: "siddharth",
    quote: "Love this place because you don\u2019t charge for bats and ball.",
    name: "Siddharth Powaku",
    handle: "★★★★★ · Google review",
  },
  {
    id: "kunam",
    quote:
      "I had an excellent experience at this facility. The courts are top-notch with great lighting and clean, comfortable seating areas. Highly recommend this place for anyone looking to play pickleball in a welcoming, well-maintained environment.",
    name: "Kunam Krishna",
    handle: "★★★★★ · Google review",
  },
  {
    id: "saravanan",
    quote: "The best place to relieve stress and recharge!",
    name: "Saravanan Natarajan",
    handle: "★★★★★ · Google review",
  },
  {
    id: "prasad",
    quote: "Such a special place — beautiful new facility, great people, well-organised.",
    name: "Prasad Bhogi",
    handle: "★★★★★ · Google review",
  },
  {
    id: "purnarekha",
    quote: "Great court, friendly staff and love this place. Best place in Hyderabad.",
    name: "Purnarekha N",
    handle: "★★★★★ · Google review",
  },
  {
    id: "raviram",
    quote: "Loved the court! Smooth turf and friendly staff. Perfect for quick games.",
    name: "Ravi Ram Palvai",
    handle: "★★★★★ · Google review",
  },
  {
    id: "sanghavi",
    quote:
      "Amazing place to try if you haven\u2019t already! Well-maintained courts. Perfect way to spend time and it keeps you coming back for more!",
    name: "Sanghavi Suresh",
    handle: "★★★★★ · Google review",
  },
];
