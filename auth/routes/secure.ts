import express from "express";
const router = express.Router(); // Instantiate a new router
import DebugControl from "../utilities/debug";

router.get("/", (req, res) => {
  // Successfully reached if can hit this :)
  DebugControl.log.variable({
    name: "res.locals.oauth.token",
    value: res.locals.oauth.token,
  });
  res.json({ success: true });
});

export default router;
