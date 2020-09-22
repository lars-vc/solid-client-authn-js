/*
 * Copyright 2020 Inrupt Inc.
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

import SessionInfoManager from "../SessionInfoManager";
import {
  ISessionInfo,
  ISessionInfoManager,
  ISessionInfoManagerOptions,
  IStorageUtility,
} from "@inrupt/solid-client-authn-core";

export const SessionCreatorCreateResponse: ISessionInfo = {
  sessionId: "global",
  isLoggedIn: true,
  webId: "https://pod.com/profile/card#me",
};
export const SessionCreatorGetSessionResponse: ISessionInfo = SessionCreatorCreateResponse;

export const SessionInfoManagerMock: jest.Mocked<ISessionInfoManager> = {
  update: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    async (sessionId: string, options: ISessionInfoManagerOptions) => {}
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get: jest.fn(async (sessionId: string) =>
    Promise.resolve(SessionCreatorCreateResponse)
  ),
  getAll: jest.fn(async () => Promise.resolve([SessionCreatorCreateResponse])),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clear: jest.fn(async (sessionId: string) => Promise.resolve()),
};

export function mockSessionInfoManager(
  storageUtility: IStorageUtility
): ISessionInfoManager {
  return new SessionInfoManager(storageUtility);
}