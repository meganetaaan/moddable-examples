import {} from "piu/MC";
import runtimeConfig from "mc/config";
import Timer from "timer";
import AudioSampleStream from "audio-stream";
import ToneSampleStream from "tone-stream";
import SpectrumWorkerStream from "spectrum-worker-stream";
import SpectrumPort from "spectrum-port";
import config from "config";

const MainApplication = Application.template(() => ({
	skin: new Skin({ fill: "#071019" }),
	contents: [
		SpectrumPort(config),
	],
}));

export default function () {
	const application = new MainApplication({}, {
		commandListLength: 4096,
		displayListLength: 4096,
		touchCount: 0,
	});
	const spectrumPort = application.first;

	try {
		const syntheticAudio = (runtimeConfig.syntheticAudio === true) || (runtimeConfig.syntheticAudio === "true");
		const audio = syntheticAudio
			? new ToneSampleStream({ sampleRate: config.sampleRate, frequency: 1000, chunkSize: config.inputChunkSize })
			: new AudioSampleStream({ sampleRate: config.sampleRate });
		spectrumPort.delegate("onSourceChanged", syntheticAudio ? "1 kHz TEST TONE" : "LISTENING");
		trace(`spectrum source: ${syntheticAudio ? "1 kHz test tone" : "audio input"}\n`);
		let firstSpectrum = true;
		let latestSpectrum;
		Timer.repeat(() => {
			if (!latestSpectrum)
				return;
			spectrumPort.delegate("onSpectrum", latestSpectrum);
			latestSpectrum = undefined;
		}, Math.round(1000 / config.displayFPS));
		const analyzer = new SpectrumWorkerStream({
			onSpectrum(spectrum) {
				if (firstSpectrum) {
					trace(`first spectrum: ${spectrum.peakFrequency} Hz, ${Math.round(spectrum.peakDecibels)} dBFS\n`);
					firstSpectrum = false;
				}
				latestSpectrum = spectrum;
			},
		});

		audio.pipeTo(analyzer).catch(error => {
			trace(`spectrum stream failed: ${error}\n`);
			spectrumPort.delegate("onStreamError", error);
		});
	}
	catch (error) {
		trace(`audio input failed: ${error}\n`);
		spectrumPort.delegate("onStreamError", error);
	}
}
