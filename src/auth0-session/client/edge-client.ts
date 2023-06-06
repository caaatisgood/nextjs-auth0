import { Auth0Request } from '../http';
import {
  CallbackExtras,
  CallbackParamsType,
  OpenIDCallbackChecks,
  TokenEndpointResponse,
  AbstractClient,
  EndSessionParameters
} from './abstract-client';

export class EdgeClient extends AbstractClient {
  async callbackParams(req: Auth0Request) {
    return req as any;
  }

  async callback(
    redirectUri: string,
    parameters: CallbackParamsType,
    checks?: OpenIDCallbackChecks,
    extras?: CallbackExtras
  ): Promise<TokenEndpointResponse> {
    return { redirectUri, parameters, checks, extras } as any;
  }

  async authorizationUrl(parameters?: Record<string, unknown>): Promise<string> {
    return parameters as any;
  }

  async endSessionUrl(parameters?: EndSessionParameters): Promise<string> {
    return parameters as any;
  }

  async userinfo(accessToken: string): Promise<Record<string, unknown>> {
    return accessToken as any;
  }

  async refresh(refreshToken: string, extras: { exchangeBody: Record<string, any> }): Promise<TokenEndpointResponse> {
    return { refreshToken, extras } as any;
  }
}
