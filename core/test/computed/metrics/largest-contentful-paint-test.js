/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LanternLargestContentfulPaint} from '../../../computed/metrics/lantern-largest-contentful-paint.js';
import {LargestContentfulPaint} from '../../../computed/metrics/largest-contentful-paint.js';
import {getURLArtifactFromDevtoolsLog, readJson} from '../../test-utils.js';

const trace = readJson('../../fixtures/artifacts/paul/trace.json', import.meta);
const devtoolsLog = readJson('../../fixtures/artifacts/paul/devtoolslog.json', import.meta);

describe('Metrics: LCP', () => {
  const gatherContext = {gatherMode: 'navigation'};

  it('should compute predicted value', async () => {
    // TODO(15841): investigate difference.
    if (process.env.INTERNAL_LANTERN_USE_TRACE !== undefined) {
      return;
    }

    const settings = {throttlingMethod: 'simulate'};
    const context = {settings, computedCache: new Map()};
    const URL = getURLArtifactFromDevtoolsLog(devtoolsLog);
    const result = await LargestContentfulPaint.request({trace, devtoolsLog, gatherContext,
      settings, URL, SourceMaps: [], simulator: null}, context);

    expect({
      timing: Math.round(result.timing),
      optimistic: Math.round(result.optimisticEstimate.timeInMs),
      pessimistic: Math.round(result.pessimisticEstimate.timeInMs)}).
toMatchInlineSnapshot(`
Object {
  "optimistic": 1059,
  "pessimistic": 1059,
  "timing": 1059,
}
`);
  });

  it('should compute an observed value', async () => {
    const settings = {throttlingMethod: 'provided'};
    const context = {settings, computedCache: new Map()};
    const URL = getURLArtifactFromDevtoolsLog(devtoolsLog);
    const result = await LargestContentfulPaint.request({trace, devtoolsLog, gatherContext,
      settings, URL, SourceMaps: [], simulator: null}, context);

    await expect(result).toMatchInlineSnapshot(`
Object {
  "timestamp": 343577475882,
  "timing": 291.834,
}
`);
  });

  it(
    'when simulating, should return the FCP result ' +
      'when original FCP and LCP timestamps are the same',
    async () => {
      const settings = {throttlingMethod: 'simulate'};
      const URL = getURLArtifactFromDevtoolsLog(devtoolsLog);

      const simulatedLcpOnlyResult =
        await LanternLargestContentfulPaint.withFcpShortCircuitDisabled(() =>
          LanternLargestContentfulPaint.request({
            trace,
            devtoolsLog,
            gatherContext,
            settings,
            URL,
            SourceMaps: [],
            simulator: null,
          }, {settings, computedCache: new Map()})
        );

      const simulatedLcpWithFcpResult = await LargestContentfulPaint.request({
        trace,
        devtoolsLog,
        gatherContext,
        settings,
        URL,
        SourceMaps: [],
        simulator: null,
      }, {settings, computedCache: new Map()});

      expect(simulatedLcpOnlyResult.timing).not.toBe(simulatedLcpWithFcpResult.timing);
      expect(simulatedLcpOnlyResult.optimisticEstimate.timeInMs)
      .not.toBe(simulatedLcpWithFcpResult.optimisticEstimate.timeInMs);
      expect(simulatedLcpOnlyResult.pessimisticEstimate.timeInMs)
      .not.toBe(simulatedLcpWithFcpResult.pessimisticEstimate.timeInMs);
    });
});
