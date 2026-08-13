import Timer from "timer";
import { ReadableStream } from "web/streams";

/* Deterministic input for simulator and automated pipeline verification. */
export default class ToneSampleStream extends ReadableStream {
	constructor(options) {
		let timer;
		let phase = 0;
		const tableSize = 1024;
		const phaseStep = (tableSize * options.frequency) / options.sampleRate;
		const waveTable = new Int16Array(tableSize);
		for (let i = 0; i < tableSize; i++)
			waveTable[i] = Math.round(16384 * Math.sin((2 * Math.PI * i) / tableSize));
		const samplePool = [
			new Int16Array(options.chunkSize),
			new Int16Array(options.chunkSize),
			new Int16Array(options.chunkSize),
		];
		let poolIndex = 0;
		const interval = Math.max(1, Math.round((1000 * options.chunkSize) / options.sampleRate));

		super({
			start(controller) {
				timer = Timer.repeat(() => {
					if (controller.desiredSize <= 0)
						return;
					const samples = samplePool[poolIndex];
					poolIndex = (poolIndex + 1) % samplePool.length;
					for (let i = 0; i < samples.length; i++) {
						samples[i] = waveTable[phase | 0];
						phase += phaseStep;
						if (phase >= tableSize)
							phase -= tableSize;
					}
					controller.enqueue(samples);
				}, interval);
			},
			cancel() {
				if (timer !== undefined) {
					Timer.clear(timer);
					timer = undefined;
				}
			},
		}, {
			highWaterMark: 2,
			size() { return 1; },
		});
	}
}
