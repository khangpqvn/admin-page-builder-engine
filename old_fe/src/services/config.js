const url = window && window.location && window.location.hostname;
let hostName = 'https://backend.ongbantat.store'
if (url === '127.0.0.1' ) {
  hostName = 'https://backend.ongbantat.store'
}
if (url === 'localhost') {
  hostName = 'http://localhost:1337'
}
let config = {
  host: hostName,
  debug: true
}
export default config;
