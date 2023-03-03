// See https://oauth2-server.readthedocs.io/en/latest/model/spec.html for what you can do with this
import crypto from "crypto";
import prisma from "../utilities/prisma";
import OAuth2Server from "oauth2-server";
import type { User, Client, Token } from "@prisma/client";

// const db = {
//   // Here is a fast overview of what your db model should look like
//   authorizationCode: {
//     authorizationCode: "", // A string that contains the code
//     expiresAt: new Date(), // A date when the code expires
//     redirectUri: "", // A string of where to redirect to with this code
//     client: null, // See the client section
//     user: null, // Whatever you want... This is where you can be flexible with the protocol
//   },
//   client: {
//     // Application wanting to authenticate with this server
//     clientId: "", // Unique string representing the client
//     clientSecret: "", // Secret of the client; Can be null
//     grants: [], // Array of grants that the client can use (ie, `authorization_code`)
//     redirectUris: [], // Array of urls the client is allowed to redirect to
//   },
//   token: {
//     accessToken: "", // Access token that the server created
//     accessTokenExpiresAt: new Date(), // Date the token expires
//     client: null, // Client associated with this token
//     user: null, // User associated with this token
//     refreshToken: "",
//     refreshTokenExpiresAt: new Date(),
//   },
// };

import DebugControl from "../utilities/debug";

// type Token = {};

// type User = {
//   /// user
// };

// type Client = {
//   /// client
// };

const model = {
  getClient: async function (clientId: string, clientSecret: string) {
    // query db for details with client
    log({
      title: "Get Client",
      parameters: [
        { name: "clientId", value: clientId },
        { name: "clientSecret", value: clientSecret },
      ],
    });
    // db.client = {
    //   // Retrieved from the database
    //   clientId: clientId,
    //   clientSecret: clientSecret,
    //   grants: ["authorization_code", "refresh_token"],
    //   redirectUris: ["http://localhost:3030/client/app"],
    // };
    // const user = await prisma.client.findFirst({
    //   where: {
    //     clientId,
    //     clientSecret,
    //   },
    // });

    // const user = {
    //   // Retrieved from the database
    //   clientId: clientId,
    //   clientSecret: clientSecret,
    //   grants: ["authorization_code", "refresh_token"],
    //   redirectUris: ["http://localhost:3030/client/app"],
    // };
    debugger;
    if (!clientSecret) {
      const client = await prisma.client.findFirst({
        where: {
          clientId,
        },
      });

      if (!client) return null;

      return {
        ...client,
        grants: client?.grants.split(","),
        redirectUris: client?.dataUris.split(","),
      };
    }
    const client = await prisma.client.findFirst({
      where: {
        clientId,
        clientSecret,
      },
    });

    if (!client) return null;

    return {
      ...client,
      grants: client?.grants.split(","),
      redirectUris: client?.dataUris.split(","),
    };
  },
  // generateAccessToken: (client, user, scope) => { // generates access tokens
  //   log({
  //     title: 'Generate Access Token',
  //     parameters: [
  //       {name: 'client', value: client},
  //       {name: 'user', value: user},
  //     ],
  //   })
  //
  // },
  saveToken: async (
    token: OAuth2Server.Token,
    client: OAuth2Server.Client,
    user: OAuth2Server.User
  ) => {
    /* This is where you insert the token into the database */
    log({
      title: "Save Token",
      parameters: [
        { name: "token", value: token },
        { name: "client", value: client },
        { name: "user", value: user },
      ],
    });

    debugger;

    const scopeToString = Array.isArray(token.scope)
      ? token.scope.join(",")
      : token.scope;

    const responseToken = await prisma.token.create({
      data: {
        accessToken: token.accessToken || "",
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken, // NOTE this is only needed if you need refresh tokens down the line
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        clientId: client.clientId,
        userId: user.id,
        scope: scopeToString,
      },
    });

    log({
      title: "Create Token Reponse",
      parameters: [{ name: "Create Token", value: responseToken }],
    });

    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken, // NOTE this is only needed if you need refresh tokens down the line
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client: client,
      user: user,
    };
  },
  getAccessToken: async (token: string) => {
    /* This is where you select the token from the database where the code matches */
    log({
      title: "Get Access Token",
      parameters: [{ name: "token", value: token }],
    });
    if (!token || token === "undefined") return false;

    const accessToken = await prisma.token.findFirst({
      where: {
        accessToken: token,
      },
      select: {
        accessToken: true,
        accessTokenExpiresAt: true,
        clientId: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
        userId: true,
        user: true,
        client: true,
      },
    });

    if (!accessToken) return null;

    return accessToken as OAuth2Server.Token;
  },
  getRefreshToken: async (token: string) => {
    /* Retrieves the token from the database */
    log({
      title: "Get Refresh Token",
      parameters: [{ name: "token", value: token }],
    });

    const refreshToken = await prisma.token.findFirst({
      where: {
        refreshToken: token,
      },
      select: {
        accessToken: true,
        accessTokenExpiresAt: true,
        clientId: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
        userId: true,
        user: true,
        client: true,
      },
    });

    DebugControl.log.variable({ name: "db.token", value: refreshToken });
    return refreshToken;
  },
  revokeToken: async (token: OAuth2Server.Token) => {
    /* Delete the token from the database */
    log({
      title: "Revoke Token",
      parameters: [{ name: "token", value: token }],
    });
    if (!token) return false;

    const result = await prisma.token.delete({
      where: {
        accessToken: token.accessToken,
      },
    });

    return result;
  },
  // generateAuthorizationCode: (client, user, scope) => {
  //   /*
  //   For this to work, you are going have to hack this a little bit:
  //   1. navigate to the node_modules folder
  //   2. find the oauth_server folder. (node_modules/express-oauth-server/node_modules/oauth2-server)
  //   3. open lib/handlers/authorize-handler.js
  //   4. Make the following change (around line 136):

  //   AuthorizeHandler.prototype.generateAuthorizationCode = function (client, user, scope) {
  //     if (this.model.generateAuthorizationCode) {
  //       // Replace this
  //       //return promisify(this.model.generateAuthorizationCode).call(this.model, client, user, scope);
  //       // With this
  //       return this.model.generateAuthorizationCode(client, user, scope)
  //     }
  //     return tokenUtil.generateRandomToken();
  //   };
  //   */

  //   log({
  //     title: "Generate Authorization Code",
  //     parameters: [
  //       { name: "client", value: client },
  //       { name: "user", value: user },
  //     ],
  //   });

  //   const seed = crypto.randomBytes(256);
  //   const code = crypto.createHash("sha1").update(seed).digest("hex");
  //   return () => {
  //     debugger;
  //     return "ssf";
  //   };
  // },
  saveAuthorizationCode: async (
    code: OAuth2Server.AuthorizationCode,
    client: OAuth2Server.Client,
    user: OAuth2Server.User
  ) => {
    /* This is where you store the access code data into the database */
    log({
      title: "Save Authorization Code",
      parameters: [
        { name: "code", value: code },
        { name: "client", value: client },
        { name: "user", value: user },
      ],
    });

    const date = new Date();
    date.setDate(date.getDate() + 5);
    const result = await prisma.authorizationCode.create({
      data: {
        authorizationCode: code.authorizationCode,
        expiresAt: date,
        clientId: client.clientId,
        userId: user.user,
        redirectUri: code.redirectUri,
      },
      select: {
        user: true,
        client: true,
        authorizationCode: true,
        expiresAt: true,
        userId: true,
        redirectUri: true,
      },
    });

    return result;

    // db.authorizationCode = {
    //   ...db.authorizationCode,
    //   authorizationCode: code.authorizationCode,
    //   expiresAt: code.expiresAt,
    //   client: client,
    //   user: user,
    // };
    // return new Promise((resolve) =>
    //   resolve(
    //     Object.assign(
    //       {
    //         redirectUri: `${code.redirectUri}`,
    //       },
    //       result
    //     )
    //   )
    // );
  },
  getAuthorizationCode: async (authorizationCode: string) => {
    debugger;
    /* this is where we fetch the stored data from the code */
    log({
      title: "Get Authorization code",
      parameters: [{ name: "authorizationCode", value: authorizationCode }],
    });

    const result = await prisma.authorizationCode.findFirst({
      where: {
        authorizationCode: authorizationCode,
      },
      select: {
        authorizationCode: true,
        client: true,
        userId: true,
        expiresAt: true,
        user: true,
        redirectUri: true,
      },
    });

    return result;
  },
  revokeAuthorizationCode: async (
    authorizationCode: OAuth2Server.AuthorizationCode
  ) => {
    /* This is where we delete codes */
    log({
      title: "Revoke Authorization Code",
      parameters: [{ name: "authorizationCode", value: authorizationCode }],
    });

    const result = await prisma.authorizationCode.delete({
      where: {
        authorizationCode: authorizationCode.authorizationCode,
      },
    });

    // db.authorizationCode = {
    //   // DB Delete in this in memory example :)
    //   authorizationCode: "", // A string that contains the code
    //   expiresAt: new Date(), // A date when the code expires
    //   redirectUri: "", // A string of where to redirect to with this code
    //   client: null, // See the client section
    //   user: null, // Whatever you want... This is where you can be flexible with the protocol
    // };
    // const codeWasFoundAndDeleted = true; // Return true if code found and deleted, false otherwise
    return result ? true : false;
  },
  verifyScope: (
    token: OAuth2Server.Token,
    scope: string | string[] | undefined
  ) => {
    debugger;
    /* This is where we check to make sure the client has access to this scope */
    log({
      title: "Verify Scope",
      parameters: [
        { name: "token", value: token },
        { name: "scope", value: scope },
      ],
    });
    const userHasAccess = true; // return true if this user / client combo has access to this resource
    return new Promise<boolean>((resolve) => resolve(userHasAccess));
  },

  getUserFromClient: async (client: OAuth2Server.Client) => {
    debugger;
    /* This is where we handle getting user from client for client_credentials flow/grant type */
    log({
      title: "Get User From Client",
      parameters: [{ name: "client", value: client }],
    });

    const user = await prisma.client.findFirst({
      where: {
        clientId: client.clientId,
      },
      select: {
        user: true,
      },
    });

    return user?.user;
  },
};

export default model;

type LogParams = {
  title: string;
  parameters: { name: string; value: any }[];
};

function log({ title, parameters }: LogParams) {
  DebugControl.log.functionName(title);
  DebugControl.log.parameters(parameters);
}
