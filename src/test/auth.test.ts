import { describe, it, expect, vi } from "vitest";
import { authenticate } from "../middleware/authenticate.js";

describe("authenticate middleware", () => {
  it("should mock user object", () => {
    const req: any = {};
    const res: any = {};
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: "sanjaya", email: "san@gmail.com" });
    expect(next).toHaveBeenCalled();
  });
});
