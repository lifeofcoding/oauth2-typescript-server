import express, { Request, Response, NextFunction } from "express";
// import request from "request";

const app = express();
const port = 3030;
import bodyParser from "body-parser";
import oauthServer from "./oauth/server";

import DebugControl from "./utilities/debug";
import auth from "./routes/auth";
import client from "./routes/client";
import secure from "./routes/secure";
import prisma from "./utilities/prisma";

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(DebugControl.log.request());

app.use("/client", client); // Client routes
app.use("/oauth", auth); // routes to access the auth stuff
// Note that the next router uses middleware. That protects all routes within this middleware
app.use(
  "/secure",
  (req: Request, res: Response, next: NextFunction) => {
    DebugControl.log.flow("Authentication");
    return next();
  },
  oauthServer.authenticate(),
  secure
); // routes to access the protected stuff
app.post(
  "/introspect",
  async (req: Request, res: Response, next: NextFunction) => {
    debugger;
    const {
      token,
      client_id: clientId,
      client_secret: clientSecret,
    } = req.body;

    DebugControl.log.flow("Introspect");
    /* Check if the FHIR servers clientId and clientSceret exist */
    const client = await prisma.client.findFirst({
      where: {
        clientId,
        clientSecret,
      },
    });

    /* Delete Expired tokens */
    const deletedTokens = await prisma.token.deleteMany({
      where: {
        clientId,
        accessToken: token,
        accessTokenExpiresAt: {
          lte: new Date(),
        },
      },
    });

    console.log("Deleted Tokens", deletedTokens);
    DebugControl.log.flow(`Removed ${deletedTokens.count} tokens`);

    const response = {
      active: false,
      client_id: clientId,
      scope: "patient/*.read openid fhirUser",
      sub: "c91dfe96-731d-4e66-b4f9-01f8f8a4b7b2", // user id
      patient: "456", // ? not required it seems
      fhirUser: "https://ehr.example.org/fhir/Patient/123", // ? not required it seems
      exp: new Date(), //1597678964
    };

    if (client) {
      const returnToken = await prisma.token.findFirst({
        where: {
          clientId,
          accessToken: token,
          accessTokenExpiresAt: {
            gt: new Date(),
          },
        },
      });

      if (returnToken) {
        response.active = true;
        response.exp = returnToken.accessTokenExpiresAt;
        response.scope = returnToken.scope || "";
      }
    } else {
      response.active = false;
    }

    return res.json(response);
    // const tokenReq = oauthServer.token({
    //   token,
    //   clientId: client_id,
    //   clientSecret: client_secret,
    //   grant_type: "client_credentials",
    // });
    // return tokenReq(req, res, next);

    // request.post(
    //   {
    //     headers: { "content-type": "application/x-www-form-urlencoded" },
    //     url: "http://localhost/test2.php",
    //     body: "mes=heydude",
    //   },
    //   function (error, response, body) {
    //     console.log(body);
    //   }
    // );
  }
);
app.use("/", (req: Request, res: Response) => res.redirect("/client"));

app.listen(port);
console.log("Oauth Server listening on port ", port);

module.exports = app; // For testing
