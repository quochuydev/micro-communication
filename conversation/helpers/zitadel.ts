import { sendRequest } from "./api-caller";

type GetClientCredentialsToken = {
  url: "/oauth/v2/token";
  method: "post";
  data: BodyInit;
  result: {
    access_token: string;
    expires_in: number; //seconds
  };
};

export async function getClientCredentialsToken(params: {
  host: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const { host, clientId, clientSecret } = params;

  const scope = "openid urn:zitadel:iam:org:project:id:zitadel:aud";

  const searchParams = new URLSearchParams();
  searchParams.append("grant_type", "client_credentials");
  searchParams.append("client_id", clientId);
  searchParams.append("client_secret", clientSecret);
  searchParams.append("scope", scope);

  const result = await sendRequest<GetClientCredentialsToken>(host, {
    url: "/oauth/v2/token",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: searchParams,
  });

  return result.access_token;
}
