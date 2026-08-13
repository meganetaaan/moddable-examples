const SpectrumConfig = Object.freeze({
	sampleRate: 22050,
	fftSize: 256,
	hopSize: 256,
	inputChunkSize: 512,
	analysisEveryFrames: 4,
	displayFPS: 20,
	bandCount: 24,
	minFrequency: 60,
	minDecibels: -80,
	maxDecibels: -10,
	smoothing: 0.68,
});

export default SpectrumConfig;
