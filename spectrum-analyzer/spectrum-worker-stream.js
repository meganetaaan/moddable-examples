import Worker from "worker";
import { WritableStream } from "web/streams";

/* A one-in-flight WritableStream that applies real backpressure to AudioIn. */
export default class SpectrumWorkerStream extends WritableStream {
	constructor(options) {
		let resolveWrite;
		let rejectWrite;
		const worker = new Worker("spectrum-worker", {
			static: 48 * 1024,
			chunk: {
				initial: 20 * 1024,
				incremental: 4 * 1024,
			},
			heap: {
				initial: 1024,
				incremental: 256,
			},
			stack: 256,
			nativeStack: 8 * 1024,
			priority: 1,
		});

		worker.onmessage = message => {
			const resolve = resolveWrite;
			const reject = rejectWrite;
			resolveWrite = undefined;
			rejectWrite = undefined;
			if (message?.error) {
				reject?.(new Error(message.error));
				worker.terminate();
				return;
			}
			try {
				if (message !== 0)
					options.onSpectrum(message);
				resolve?.();
			}
			catch (error) {
				reject?.(error);
				worker.terminate();
			}
		};

		super({
			write(samples) {
				return new Promise((resolve, reject) => {
					resolveWrite = resolve;
					rejectWrite = reject;
					try {
						worker.postMessage(samples);
					}
					catch (error) {
						resolveWrite = undefined;
						rejectWrite = undefined;
						reject(error);
					}
				});
			},
			close() {
				worker.terminate();
			},
			abort(reason) {
				rejectWrite?.(reason);
				resolveWrite = undefined;
				rejectWrite = undefined;
				worker.terminate();
			},
		}, {
			highWaterMark: 1,
			size() { return 1; },
		});
	}
}
