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

'use strict';

class ServiceWorkerTest {

  run(inputs) {
    if (inputs.length < 1) {
      return Promise.reject('No data provided.');
    }

    if (typeof inputs.driver !== 'object') {
      return Promise.reject('No Driver provided.');
    }

    if (typeof inputs.url !== 'string') {
      return Promise.reject('No URL provided.');
    }

    this.url = inputs.url;

    return new Promise((resolve, reject) => {
      let driver = inputs.driver;

      // hacky settimeout to delay SW work from page loading
      setTimeout(_ => {
        driver
          .requestTab(this.url)
          .then(_ => {
            driver.subscribeToServiceWorkerDetails(this.swVersionUpdated.bind(this), resolve);
          });
      }, 5 * 1000);
    });
  }

  swVersionUpdated(data, resolve) {
    var swObj = data.versions.filter(sw => sw.scriptURL.includes(this.url)).pop();
    resolve(swObj);
  }

  hasFetchRegistered(fileContents) {
      // Get the Service Worker JS. We need a nicer way to do this!
          // return inputs.loader.load(serviceWorkerPath)
          //     .then(fileContents => {
          //       result.fetch = this.hasFetchRegistered(fileContents);
          //       return resolve(result);
          //     });

    let matchSelfFetch = /self\.onfetch/igm;
    let matchAddEventListener = /self\.addEventListener\s?\(\s?'fetch'/igm;

    return (matchSelfFetch.test(fileContents) ||
        matchAddEventListener.test(fileContents));
  }

}

module.exports = new ServiceWorkerTest();
