const fs = require('fs');
const fluid = require('fluid-music');

const msg = [
  fluid.global.activate('session.tracktionedit', true),
  fluid.audiotrack.select('test'),
  fluid.pluginTCompressor.select(),
  fluid.plugin.getReport(),
]

const handleResult = (result) => {
  for (message of result.elements) {
    console.log('Message address:', message.address);
    if (message.address === '/plugin/report/reply') {
      const errorCode = message.args[0].value;
      if (errorCode) {
        console.error('Server Error:', message.args[1].value);
      } else {
        const object = JSON.parse(message.args[2].value);
        console.log(object);
        handleBase64String(object.stateBase64);
      }
    }
  }
}

const handleBase64String = (b64) => {
  const buffer = Buffer.from(b64, 'base64');
  const file = fs.createWriteStream('tCompState-fromTracktion');
  file.write(buffer);
  // To get just the VST part, use file.write(buffer.slice(160));
}

const client = new fluid.Client();
client.send(msg)
  .then(handleResult)
  .catch(error => {
    console.error('Error:', error); 
  });
