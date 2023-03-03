import OAuthServer from "express-oauth-server";
import model from "./model";

const oauthServer = new OAuthServer({
  model: model,
  // grants: ["authorization_code", "refresh_token", "client_credentials"],
  accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
  allowEmptyState: true,
  allowExtendedTokenAttributes: true,
});

export default oauthServer;
