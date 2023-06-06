import { Config } from '../config';
import { Auth0Request } from '../http';

export type Telemetry = {
  name: string;
  version: string;
};

export interface CallbackParamsType {
  access_token?: string;
  code?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
  expires_in?: string;
  id_token?: string;
  state?: string;
  token_type?: string;
  session_state?: string;
  response?: string;

  [key: string]: unknown;
}

export interface CallbackExtras {
  exchangeBody?: Record<string, any>;
  clientAssertionPayload?: Record<string, any>;
}

export interface OpenIDCallbackChecks {
  max_age?: number;
  nonce?: string;
  response_type?: string;
  state?: string;
  code_verifier?: string;
}

export interface TokenEndpointResponse {
  access_token?: string;
  token_type?: string;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  expires_in?: number;
  [key: string]: unknown;
}

export interface EndSessionParameters {
  id_token_hint?: string;
  post_logout_redirect_uri?: string;
  state?: string;
  client_id?: string;
  logout_hint?: string;

  [key: string]: unknown;
}

export abstract class AbstractClient {
  constructor(protected config: Config, protected telemetry: Telemetry) {}
  abstract callbackParams(req: Auth0Request): Promise<CallbackParamsType>;
  abstract callback(
    redirectUri: string,
    parameters: CallbackParamsType,
    checks?: OpenIDCallbackChecks,
    extras?: CallbackExtras
  ): Promise<TokenEndpointResponse>;
  abstract authorizationUrl(parameters?: Record<string, unknown>): Promise<string>;
  abstract endSessionUrl(parameters?: EndSessionParameters): Promise<string>;
  abstract userinfo(accessToken: string): Promise<Record<string, unknown>>;
  abstract refresh(
    refreshToken: string,
    extras: { exchangeBody?: Record<string, any> }
  ): Promise<TokenEndpointResponse>;
}
