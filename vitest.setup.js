import { vi } from "vitest";

vi.mock("@/middleware/authenticate", () => ({
  authenticate: vi.fn((req, res, next) => {
    req.user = {
      id: "sanjaya",
      email: "san@gmail.com",
    };
    next();
  }),
}));
