// Optional workaround ONLY for a runtime whose native interface enumeration fails.
// Leave native results untouched when available. Limit the fallback to loopback.
const os = require('node:os');
const original = os.networkInterfaces;
os.networkInterfaces = function () {
  try { return original(); }
  catch (error) {
    if (!String(error.message).includes('uv_interface_addresses')) throw error;
    return {lo:[{address:'127.0.0.1',netmask:'255.0.0.0',family:'IPv4',mac:'00:00:00:00:00:00',internal:true,cidr:'127.0.0.1/8'}]};
  }
};
