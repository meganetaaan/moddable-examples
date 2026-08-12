export default function getMacAddress () {
  return native('mod_get_mac_address').call()
}
