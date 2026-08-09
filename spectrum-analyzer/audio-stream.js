import AudioIn from "embedded:io/audio/in";
import { ReadableStream } from "web/streams";

/*
 * Turns AudioIn's callback API into a bounded stream of Int16Array chunks.
 * AudioIn must always be drained; when downstream is behind, the oldest input
 * is discarded instead of allowing latency to grow without bound.
 */
export default class AudioSampleStream extends ReadableStream {
	constructor(options = {}) {
		let input;
		let discardBuffer = new ArrayBuffer(2048);

		super({
			start(controller) {
				input = new AudioIn({
					sampleRate: options.sampleRate,
					channels: 1,
					bitsPerSample: 16,
					onReadable(byteLength) {
						// LPCM16 always arrives on a two-byte boundary.
						byteLength &= ~1;
						if (!byteLength)
							return;

						if (controller.desiredSize > 0) {
							const buffer = this.read(byteLength);
							controller.enqueue(new Int16Array(buffer));
						}
						else {
							if (discardBuffer.byteLength < byteLength)
								discardBuffer = new ArrayBuffer(byteLength);
							this.read(new Uint8Array(discardBuffer, 0, byteLength));
						}
					},
				});
				input.start();
			},
			cancel() {
				if (input) {
					input.stop();
					input.close();
					input = undefined;
				}
			},
		}, {
			highWaterMark: 2,
			size() { return 1; },
		});
	}
}
