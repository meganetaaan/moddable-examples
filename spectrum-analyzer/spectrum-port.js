import {} from "piu/MC";

const BACKGROUND = "#071019";
const PANEL = "#0b1823";
const GRID = "#203341";
const AXIS = "#607786";
const TEXT = "#d9f3ff";
const DIM_TEXT = "#8ba5b4";
const LOW = "#23d5ab";
const MID = "#29b6f6";
const HIGH = "#ffb547";
const CLIP = "#ff5d73";
const PEAK = "#e9fbff";

const LeftStyle = new Style({ font: "16px Open Sans", horizontal: "left", vertical: "middle" });
const CenterStyle = new Style({ font: "16px Open Sans", horizontal: "center", vertical: "middle" });
const RightStyle = new Style({ font: "16px Open Sans", horizontal: "right", vertical: "middle" });

function shortFrequency(frequency) {
	if (frequency >= 1000) {
		const tenths = Math.round(frequency / 100);
		return `${Math.floor(tenths / 10)}.${tenths % 10}k`;
	}
	return `${frequency}`;
}

const SpectrumPort = Port.template(config => ({
	left: 0, right: 0, top: 0, bottom: 0,
	Behavior: class extends Behavior {
		onCreate(port) {
			this.config = config;
			this.levels = new Uint8Array(config.bandCount);
			this.peaks = new Uint8Array(config.bandCount);
			this.peakFrequency = 0;
			this.peakDecibels = config.minDecibels;
			this.status = "LISTENING";
			this.layoutWidth = 0;
			this.layoutHeight = 0;
		}

		updateLayout(port) {
			const width = port.width;
			const height = port.height;
			this.layoutWidth = width;
			this.layoutHeight = height;
			this.compact = height < 180;
			this.headerHeight = this.compact ? 20 : 28;
			this.footerHeight = this.compact ? 15 : 21;
			this.plotLeft = width < 240 ? 22 : 34;
			this.plotRight = 5;
			this.plotTop = this.headerHeight;
			this.plotBottom = height - this.footerHeight;
			this.plotWidth = width - this.plotLeft - this.plotRight;
			this.plotHeight = this.plotBottom - this.plotTop;
			this.dataTop = this.plotTop + (this.compact ? 15 : 18);
			this.dataHeight = this.plotBottom - this.dataTop;
		}

		onDisplaying(port) {
			this.updateLayout(port);
		}

		onSpectrum(port, spectrum) {
			this.levels = spectrum.levels;
			this.peakFrequency = spectrum.peakFrequency;
			this.peakDecibels = spectrum.peakDecibels;
			for (let i = 0; i < this.peaks.length; i++) {
				if (spectrum.levels[i] >= this.peaks[i])
					this.peaks[i] = spectrum.levels[i];
				else
					this.peaks[i] = Math.max(0, this.peaks[i] - 5);
			}
			if (this.plotWidth)
				port.invalidate(this.plotLeft, this.plotTop, this.plotWidth, this.plotHeight);
			else
				port.invalidate();
		}

		onSourceChanged(port, status) {
			this.status = status;
			port.invalidate();
		}

		onStreamError(port, error) {
			this.status = `AUDIO ERROR: ${error}`;
			port.invalidate();
		}

		drawPlot(port) {
			const left = this.plotLeft;
			const plotTop = this.plotTop;
			const plotBottom = this.plotBottom;
			const plotWidth = this.plotWidth;
			const plotHeight = this.plotHeight;
			const dataTop = this.dataTop;
			const dataHeight = this.dataHeight;

			port.fillColor(PANEL, left, plotTop, plotWidth, plotHeight);

			for (let line = 0; line <= 4; line++) {
				const y = dataTop + Math.round((line * dataHeight) / 4);
				port.fillColor(GRID, left, y, plotWidth, 1);
			}

			const count = this.levels.length;
			for (let i = 0; i < count; i++) {
				const x0 = left + Math.floor((i * plotWidth) / count);
				const x1 = left + Math.floor(((i + 1) * plotWidth) / count);
				const barWidth = Math.max(1, x1 - x0 - 1);
				const level = this.levels[i];
				const barHeight = Math.round((level * dataHeight) / 255);
				let color = LOW;
				if (level > 218)
					color = CLIP;
				else if (level > 172)
					color = HIGH;
				else if (level > 100)
					color = MID;
				port.fillColor(color, x0, plotBottom - barHeight, barWidth, barHeight);

				const peakY = plotBottom - Math.round((this.peaks[i] * dataHeight) / 255);
				port.fillColor(PEAK, x0, peakY, barWidth, 1);
			}

			if (this.peakFrequency && (this.peakDecibels > this.config.minDecibels + 5)) {
				const peak = `${shortFrequency(this.peakFrequency)}Hz  ${Math.round(this.peakDecibels)}dB`;
				port.drawString(peak, RightStyle, TEXT, left, plotTop, plotWidth - 4, dataTop - plotTop);
			}
		}

		drawChrome(port) {
			const width = port.width;
			const left = this.plotLeft;
			const plotBottom = this.plotBottom;
			const plotWidth = this.plotWidth;
			const dataTop = this.dataTop;
			const dataHeight = this.dataHeight;

			port.drawString("SPECTRUM", LeftStyle, TEXT, 5, 0, width >> 1, this.headerHeight);
			port.drawString(this.status, RightStyle, DIM_TEXT, width >> 1, 0, (width >> 1) - 5, this.headerHeight);

			if (!this.compact) {
				for (let line = 0; line <= 4; line++) {
					const y = dataTop + Math.round((line * dataHeight) / 4);
					port.drawString(`${-20 * line}`, RightStyle, AXIS, 0, y - 8, left - 4, 16);
				}
				port.drawString(`${this.config.minFrequency}`, LeftStyle, DIM_TEXT, left, plotBottom, 40, this.footerHeight);
				const ratio = (Math.log(1000 / this.config.minFrequency) / Math.log((this.config.sampleRate / 2) / this.config.minFrequency));
				const kiloX = left + Math.round(ratio * plotWidth) - 20;
				port.drawString("1k", CenterStyle, DIM_TEXT, kiloX, plotBottom, 40, this.footerHeight);
				port.drawString(`${Math.round(this.config.sampleRate / 2000)}k Hz`, RightStyle, DIM_TEXT, width - 55, plotBottom, 50, this.footerHeight);
			}
		}

		onDraw(port, x, y, width, height) {
			if ((this.layoutWidth !== port.width) || (this.layoutHeight !== port.height))
				this.updateLayout(port);
			const plotOnly = (x >= this.plotLeft) && (y >= this.plotTop)
				&& ((x + width) <= (this.plotLeft + this.plotWidth))
				&& ((y + height) <= (this.plotTop + this.plotHeight));
			if (plotOnly) {
				this.drawPlot(port);
				return;
			}
			port.fillColor(BACKGROUND, 0, 0, port.width, port.height);
			this.drawPlot(port);
			this.drawChrome(port);
		}
	},
}));

export default SpectrumPort;
