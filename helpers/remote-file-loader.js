/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global window, fetch */

'use strict';

class RemoteFileLoader {

  load(url) {
    if (typeof window === 'undefined') {
      // TODO(paullewis): change this to load dynamically to avoid
      // being transpiled in every time.
      return new Promise((resolve, reject) => {
        let https = require('https');
        https.get(url, res => {
          let body = '';
          res.on('data', data => {
            body += data;
          });
          res.on('end', () => resolve(body));
        });
      });
    }

    return fetch(url).then(response => response.text());
  }
}

module.exports = RemoteFileLoader;
