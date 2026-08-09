const LOG10 = 0.4342944819032518;

export default class FFTSpectrum {
	#size;
	#hopSize;
	#sampleRate;
	#bandCount;
	#minDecibels;
	#maxDecibels;
	#smoothing;
	#analysisEveryFrames;
	#frameCounter = 0;
	#frame;
	#frameLength = 0;
	#real;
	#imaginary;
	#window;
	#windowSum = 0;
	#bitReverse;
	#cosine;
	#sine;
	#bandStart;
	#bandEnd;
	#smoothed;
	#levels;
	#spectrum;

	constructor(options) {
		const size = options.fftSize;
		if ((size < 64) || (size & (size - 1)))
			throw new RangeError("fftSize must be a power of two >= 64");
		if ((options.hopSize < 1) || (options.hopSize > size))
			throw new RangeError("hopSize must be between 1 and fftSize");

		this.#size = size;
		this.#hopSize = options.hopSize;
		this.#sampleRate = options.sampleRate;
		this.#bandCount = options.bandCount;
		this.#minDecibels = options.minDecibels;
		this.#maxDecibels = options.maxDecibels;
		this.#smoothing = options.smoothing;
		this.#analysisEveryFrames = options.analysisEveryFrames ?? 1;
		this.#frame = new Float32Array(size);
		this.#real = new Float32Array(size);
		this.#imaginary = new Float32Array(size);
		this.#window = new Float32Array(size);
		this.#bitReverse = new Uint16Array(size);
		this.#cosine = new Float32Array(size >> 1);
		this.#sine = new Float32Array(size >> 1);
		this.#bandStart = new Uint16Array(options.bandCount);
		this.#bandEnd = new Uint16Array(options.bandCount);
		this.#smoothed = new Float32Array(options.bandCount);
		this.#levels = new Uint8Array(options.bandCount);
		this.#spectrum = {
			levels: this.#levels,
			peakFrequency: 0,
			peakDecibels: options.minDecibels,
		};
		this.#prepareTables(options.minFrequency);
	}

	#prepareTables(minFrequency) {
		const size = this.#size;
		const bits = Math.round(Math.log(size) / Math.LN2);
		for (let i = 0; i < size; i++) {
			const window = 0.5 - (0.5 * Math.cos((2 * Math.PI * i) / (size - 1)));
			this.#window[i] = window;
			this.#windowSum += window;

			let value = i;
			let reversed = 0;
			for (let bit = 0; bit < bits; bit++) {
				reversed = (reversed << 1) | (value & 1);
				value >>= 1;
			}
			this.#bitReverse[i] = reversed;
		}

		for (let i = 0; i < (size >> 1); i++) {
			const angle = (2 * Math.PI * i) / size;
			this.#cosine[i] = Math.cos(angle);
			this.#sine[i] = -Math.sin(angle);
		}

		const nyquist = this.#sampleRate / 2;
		const ratio = nyquist / minFrequency;
		for (let band = 0; band < this.#bandCount; band++) {
			const low = minFrequency * Math.pow(ratio, band / this.#bandCount);
			const high = minFrequency * Math.pow(ratio, (band + 1) / this.#bandCount);
			let start = Math.floor((low * size) / this.#sampleRate);
			let end = Math.ceil((high * size) / this.#sampleRate);
			if (start < 1)
				start = 1;
			if (end <= start)
				end = start + 1;
			if (end > (size >> 1))
				end = size >> 1;
			this.#bandStart[band] = start;
			this.#bandEnd[band] = end;
			this.#smoothed[band] = this.#minDecibels;
		}
	}

	push(samples, emit) {
		let sourceOffset = 0;
		while (sourceOffset < samples.length) {
			const count = Math.min(samples.length - sourceOffset, this.#size - this.#frameLength);
			for (let i = 0; i < count; i++)
				this.#frame[this.#frameLength + i] = samples[sourceOffset + i] / 32768;
			this.#frameLength += count;
			sourceOffset += count;

			if (this.#frameLength === this.#size) {
				this.#frameCounter++;
				if (this.#frameCounter >= this.#analysisEveryFrames) {
					this.#frameCounter = 0;
					emit(this.#analyze());
				}
				const retained = this.#size - this.#hopSize;
				if (retained)
					this.#frame.copyWithin(0, this.#hopSize);
				this.#frameLength = retained;
			}
		}
	}

	#analyze() {
		const size = this.#size;
		let mean = 0;
		for (let i = 0; i < size; i++)
			mean += this.#frame[i];
		mean /= size;

		// Place windowed samples in bit-reversed order for an in-place radix-2 FFT.
		for (let i = 0; i < size; i++) {
			const destination = this.#bitReverse[i];
			this.#real[destination] = (this.#frame[i] - mean) * this.#window[i];
			this.#imaginary[destination] = 0;
		}

		for (let span = 2; span <= size; span <<= 1) {
			const half = span >> 1;
			const twiddleStep = size / span;
			for (let base = 0; base < size; base += span) {
				for (let offset = 0; offset < half; offset++) {
					const twiddle = offset * twiddleStep;
					const odd = base + offset + half;
					const even = base + offset;
					const oddReal = (this.#cosine[twiddle] * this.#real[odd]) - (this.#sine[twiddle] * this.#imaginary[odd]);
					const oddImaginary = (this.#cosine[twiddle] * this.#imaginary[odd]) + (this.#sine[twiddle] * this.#real[odd]);
					const evenReal = this.#real[even];
					const evenImaginary = this.#imaginary[even];
					this.#real[even] = evenReal + oddReal;
					this.#imaginary[even] = evenImaginary + oddImaginary;
					this.#real[odd] = evenReal - oddReal;
					this.#imaginary[odd] = evenImaginary - oddImaginary;
				}
			}
		}

		let peakBin = 1;
		let peakPower = 0;
		for (let bin = 1; bin < (size >> 1); bin++) {
			const power = (this.#real[bin] * this.#real[bin]) + (this.#imaginary[bin] * this.#imaginary[bin]);
			if (power > peakPower) {
				peakPower = power;
				peakBin = bin;
			}
		}

		const levels = this.#levels;
		const range = this.#maxDecibels - this.#minDecibels;
		const history = this.#smoothing;
		for (let band = 0; band < this.#bandCount; band++) {
			const start = this.#bandStart[band];
			const end = this.#bandEnd[band];
			let power = 0;
			for (let bin = start; bin < end; bin++)
				power += (this.#real[bin] * this.#real[bin]) + (this.#imaginary[bin] * this.#imaginary[bin]);
			const magnitude = (2 * Math.sqrt(power / (end - start))) / this.#windowSum;
			let decibels = 20 * Math.log(magnitude + 1e-12) * LOG10;
			decibels = (history * this.#smoothed[band]) + ((1 - history) * decibels);
			this.#smoothed[band] = decibels;
			let level = Math.round(255 * (decibels - this.#minDecibels) / range);
			if (level < 0)
				level = 0;
			else if (level > 255)
				level = 255;
			levels[band] = level;
		}

		const peakMagnitude = (2 * Math.sqrt(peakPower)) / this.#windowSum;
		const spectrum = this.#spectrum;
		spectrum.peakFrequency = Math.round((peakBin * this.#sampleRate) / size);
		spectrum.peakDecibels = 20 * Math.log(peakMagnitude + 1e-12) * LOG10;
		return spectrum;
	}
}
