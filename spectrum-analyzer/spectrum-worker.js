import FFTSpectrum from "fft-spectrum";
import config from "config";

const analyzer = new FFTSpectrum(config);

self.onmessage = function(samples) {
	try {
		let spectrum;
		analyzer.push(samples, result => spectrum = result);
		// Every input receives an acknowledgement. Zero means no FFT was due.
		self.postMessage(spectrum ?? 0);
	}
	catch (error) {
		self.postMessage({ error: String(error) });
	}
};
