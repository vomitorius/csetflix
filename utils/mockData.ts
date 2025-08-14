// Mock data for testing when API is not available
import type { Movie } from '~/types/movie'

export const mockTrendingMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
    release_date: "1994-09-23",
    vote_average: 9.3
  },
  {
    id: 2,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    release_date: "1972-03-14",
    vote_average: 9.2
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    release_date: "2008-07-16",
    vote_average: 9.0
  },
  {
    id: 4,
    title: "The Godfather Part II",
    poster_path: "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    overview: "The continuing saga of the Corleone crime family tells the story of a young Vito Corleone growing up in Sicily.",
    release_date: "1974-12-20",
    vote_average: 9.0
  },
  {
    id: 5,
    title: "12 Angry Men",
    poster_path: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
    overview: "The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence.",
    release_date: "1957-04-10",
    vote_average: 9.0
  }
]

export const mockRecommendedMovies: Movie[] = [
  {
    id: 6,
    title: "Pulp Fiction",
    poster_path: "/dM2w364MScsjFf8pfMbaWUcWrR.jpg",
    overview: "A burger-loving hit man, his philosophical partner, and a drug-addled gangster's moll get into trouble.",
    release_date: "1994-09-10",
    vote_average: 8.9
  },
  {
    id: 7,
    title: "Schindler's List",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    overview: "In German-occupied Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce.",
    release_date: "1993-12-15",
    vote_average: 8.9
  },
  {
    id: 8,
    title: "The Lord of the Rings: The Return of the King",
    poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam.",
    release_date: "2003-12-01",
    vote_average: 8.9
  },
  {
    id: 9,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
    release_date: "1999-10-15",
    vote_average: 8.8
  },
  {
    id: 10,
    title: "Forrest Gump",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    overview: "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man.",
    release_date: "1994-06-23",
    vote_average: 8.8
  }
]