import * as oauth from 'oauth4webapi';
import { Auth0Request } from '../http';
import {
  CallbackExtras,
  CallbackParamsType,
  OpenIDCallbackChecks,
  TokenEndpointResponse,
  AbstractClient,
  EndSessionParameters
} from './abstract-client';
import { IdentityProviderError } from '../utils/errors';
import { AccessTokenError, AccessTokenErrorCode } from '../../utils/errors';

export class EdgeClient extends AbstractClient {
  private client?: oauth.Client;
  private as?: oauth.AuthorizationServer;

  private async getClient(): Promise<[oauth.AuthorizationServer, oauth.Client]> {
    if (this.as) {
      return [this.as, this.client as oauth.Client];
    }

    const issuer = new URL('https://example.as.com');
    this.as = await oauth.discoveryRequest(issuer).then((response) => oauth.processDiscoveryResponse(issuer, response));

    this.client = {
      client_id: this.config.clientID,
      client_secret: this.config.clientSecret,
      token_endpoint_auth_method: this.config.clientAuthMethod
    };

    return [this.as, this.client as oauth.Client];
  }

  async callbackParams(req: Auth0Request) {
    const [as, client] = await this.getClient();
    const url =
      req.getMethod().toUpperCase() === 'GET' ? new URL(req.getUrl()) : new URLSearchParams(await req.getBody());
    const params = oauth.validateAuthResponse(as, client, url);
    if (oauth.isOAuth2Error(params)) {
      const err: Error & { error?: string; error_description?: string } = new Error();
      err.error = params.error;
      err.error_description = params.error_description;
      throw new IdentityProviderError(err);
    }
    return Object.fromEntries(params.entries());
  }

  async callback(
    redirectUri: string,
    parameters: CallbackParamsType,
    checks: OpenIDCallbackChecks,
    extras: CallbackExtras
  ): Promise<TokenEndpointResponse> {
    const [as, client] = await this.getClient();
    const params = new URLSearchParams(parameters);
    // TODO: support other `response_type`s
    const response = await oauth.authorizationCodeGrantRequest(
      as,
      client,
      params,
      redirectUri,
      checks?.code_verifier as string,
      { additionalParameters: extras.exchangeBody }
    );

    const result = await oauth.processAuthorizationCodeOpenIDResponse(
      as,
      client,
      response,
      checks.nonce,
      checks.max_age
    );
    if (oauth.isOAuth2Error(result)) {
      const err: Error & { error?: string; error_description?: string } = new Error();
      err.error = result.error;
      err.error_description = result.error_description;
      throw new IdentityProviderError(err);
    }
    return result;
  }

  async authorizationUrl(parameters: Record<string, unknown>): Promise<string> {
    const [as] = await this.getClient();
    const authorizationUrl = new URL(as.authorization_endpoint as string);
    authorizationUrl.searchParams.set('client_id', this.config.clientID);
    Object.entries(parameters).forEach(([key, value]) => {
      authorizationUrl.searchParams.set(key, String(value));
    });
    return authorizationUrl.toString();
  }

  async endSessionUrl(parameters?: EndSessionParameters): Promise<string> {
    return parameters as any;
  }

  async userinfo(accessToken: string): Promise<Record<string, unknown>> {
    const [as, client] = await this.getClient();
    const response = await oauth.userInfoRequest(as, client, accessToken);

    return oauth.processUserInfoResponse(as, client, oauth.skipSubjectCheck, response);
  }

  async refresh(refreshToken: string, extras: { exchangeBody: Record<string, any> }): Promise<TokenEndpointResponse> {
    const [as, client] = await this.getClient();
    const res = await oauth.refreshTokenGrantRequest(as, client, refreshToken, {
      additionalParameters: extras.exchangeBody
    });
    const result = await oauth.processRefreshTokenResponse(as, client, res);
    if (oauth.isOAuth2Error(result)) {
      const err: Error & { error?: string; error_description?: string } = new Error();
      err.error = result.error;
      err.error_description = result.error_description;
      throw new AccessTokenError(
        AccessTokenErrorCode.FAILED_REFRESH_GRANT,
        'The request to refresh the access token failed.',
        new IdentityProviderError(err)
      );
    }
    return result;
  }

  generateRandomCodeVerifier(): string {
    return oauth.generateRandomCodeVerifier();
  }

  generateRandomNonce(): string {
    return oauth.generateRandomNonce();
  }

  calculateCodeChallenge(codeVerifier: string): Promise<string> {
    return oauth.calculatePKCECodeChallenge(codeVerifier);
  }
}
