import SMBus from "pins/smbus";

const REGISTERS = Object.freeze({
  IDENTIFICATION_MODEL_ID: 0xc0,
  IDENTIFICATION_REVISION_ID: 0xc2,
  PRE_RANGE_CONFIG_VCSEL_PERIOD: 0x50,
  FINAL_RANGE_CONFIG_VCSEL_PERIOD: 0x70,
  SYSRANGE_START: 0x00,
  RESULT_INTERRUPT_STATUS: 0x13,
  RESULT_RANGE_STATUS: 0x14,
});

class VL53L0X extends SMBus {
  #buf
  #view
  constructor(dictionary) {
    super({ address: 0x29, ...dictionary });
    this.#buf = new ArrayBuffer(12);
    this.#view = new DataView(this.#buf)
  }

  get value() {
    this.writeByte(REGISTERS.SYSRANGE_START, 0x01);
    this.readBlock(REGISTERS.RESULT_RANGE_STATUS, 12, this.#buf);
    return this.#view.getUint16(10, false)
  }
}

export default VL53L0X;
