const fs = require('fs');
const fluid = require('fluid-music');

const vst3 = true; // if false, ask for vst2
// const vst3Name = '#TStereo Delay'; // is kDistributable
const vst3Name = 'Podolski'; // Is EditController (Probably derived from SingleComponentEffect)
// const vst3Name = 'Zebra2';

const jsonWriter = fs.createWriteStream('report.json');

const msg = [
  fluid.global.activate('session.tracktionedit', true),
  fluid.audiotrack.select('test'),
  vst3 ? fluid.plugin.select(vst3Name, 'vst3') : fluid.pluginTCompressor.select(),
  fluid.plugin.getReport(),
];



const handleResult = (result) => {
  for (message of result.elements) {
    console.log('Message address:', message.address);
    if (message.address === '/plugin/report/reply') {
      const errorCode = message.args[0].value;
      if (errorCode) {
        console.error('Server Error:', message.args[1].value);
      } else {
        const object = JSON.parse(message.args[2].value);
        console.log(object);//console.dir(object, {depth: null});
        jsonWriter.write(JSON.stringify(object, null, 2));
        if (object.vst3State) handleBase64String(object.vst3State);
        else if (object.vst3IComponentState) handleBase64String(object.vst3IComponentState);
        else if (object.vst2State) handleBase64String(object.vst2State);
        else throw new Error('get-tracktion-binary: missing state');
      }
    }
  }
}

const handleBase64String = (b64) => {
  const buffer = Buffer.from(b64, 'base64');
  const filename = vst3 ? 'tStereoDelayVst3-fromTracktion' : 'tCompState-fromTracktion';
  const file = fs.createWriteStream(filename);
  file.write(buffer);
}

const client = new fluid.Client();
client.send(msg)
  .then(handleResult)
  .catch(error => {
    console.error('Error:', error); 
  });
