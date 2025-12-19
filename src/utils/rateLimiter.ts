import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
