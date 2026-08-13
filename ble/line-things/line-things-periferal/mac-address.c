#include "xsmc.h"

#include "esp_mac.h"

void mod_get_mac_address(xsMachine *the)
{
	uint8_t address[6];

	if (ESP_OK != esp_read_mac(address, ESP_MAC_EFUSE_FACTORY))
		xsUnknownError("failed to read factory MAC address");

	xsmcSetArrayBuffer(xsResult, address, sizeof(address));
}
