/*
 * Copyright 2022 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @hidden
 * @packageDocumentation
 */

import IStorageUtility from "../../storage/IStorageUtility";
import ILoginOptions from "../ILoginOptions";
import { ClientType, IClient } from "./IClient";
import { IIssuerConfig } from "./IIssuerConfig";

export interface IClientRegistrarOptions {
  sessionId: string;
  clientName?: string;
  redirectUrl?: string;
  registrationAccessToken?: string;
}

/** @hidden */
export interface IClientDetails
  extends Record<string, string | number | undefined> {
  clientId: string;
  clientSecret?: string;
  clientExpiresAt?: number;
  clientName?: string;
}

/**
 * @hidden
 */
export interface IClientRegistrar {
  getClient(
    options: IClientRegistrarOptions,
    issuerConfig: IIssuerConfig
  ): Promise<IClient>;
}

function isValidUrl(url: string): boolean {
  try {
    // Here, the URL constructor is just called to parse the given string and
    // verify if it is a well-formed IRI.
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function determineSigningAlg(
  supported: string[],
  preferred: string[]
): string | null {
  return (
    preferred.find((signingAlg) => {
      return supported.includes(signingAlg);
    }) ?? null
  );
}

function determineClientType(
  options: ILoginOptions,
  issuerConfig: IIssuerConfig
): ClientType {
  if (options.clientId !== undefined && !isValidUrl(options.clientId)) {
    return "static";
  }
  if (
    issuerConfig.scopesSupported.includes("webid") &&
    options.clientId !== undefined &&
    isValidUrl(options.clientId)
  ) {
    return "solid-oidc";
  }
  // If no client_id is provided, the client must go through Dynamic Client Registration.
  // If a client_id is provided and it looks like a URI, yet the Identity Provider
  // does *not* support Solid-OIDC, then we also perform DCR (and discard the
  // provided client_id).
  return "dynamic";
}

export async function handleRegistration(
  options: ILoginOptions,
  issuerConfig: IIssuerConfig,
  storageUtility: IStorageUtility,
  clientRegistrar: IClientRegistrar
): Promise<IClient> {
  const clientType = determineClientType(options, issuerConfig);
  if (clientType === "dynamic") {
    // Added because I was missing stacktrace frames otherwise:
    // eslint-disable-next-line @typescript-eslint/return-await
    return await clientRegistrar.getClient(
      {
        sessionId: options.sessionId,
        clientName: options.clientName,
        redirectUrl: options.redirectUrl,
      },
      issuerConfig
    );
  }
  // If a client_id was provided, and the Identity Provider is Solid-OIDC compliant,
  // or it is not compliant but the client_id isn't an IRI (we assume it has already
  // been registered with the IdP), then the client registration information needs
  // to be stored so that it can be retrieved later after redirect.
  const clientDetails: IClientDetails = {
    // If the client is either static or solid-oidc compliant, its client ID cannot be undefined.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clientId: options.clientId!,
    // This only has meaning on dynamic clients:
    clientExpiresAt: 0,
  };

  if (options.clientSecret) {
    clientDetails.clientSecret = options.clientSecret;
  }

  if (options.clientName) {
    clientDetails.clientName = options.clientName;
  }

  await storageUtility.setForUser(options.sessionId, clientDetails);

  return {
    ...clientDetails,
    clientType,
  };
}
