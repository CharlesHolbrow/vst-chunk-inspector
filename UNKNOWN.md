What is that mysterious unknown parameter in the VST2 first line??

```javascript
// Dragonfly Room 2 in, 2 out (I think)
const dfr2 = {
  hex: '66 01 0000',
  bits: '01100110 10000000 0000000000000000',
  raw: Uint8Array(4) [ 102, 1, 0, 0 ],
  uint32: 358
}


//#TLimiter 2 in 2 out
const tLimiter = {
  hex: '79 01 0000',
  bits: '10011110 10000000 0000000000000000',
  raw: Uint8Array(4) [ 121, 1, 0, 0 ],
  uint32: 377
}

// ReaSampler
const reaSampler = {
  hex: '0d 01 0000',
  bits: '10110000 10000000 0000000000000000',
  raw: Uint8Array(4) [ 13, 1, 0, 0 ],
  uint32: 269
}

// ReaSynDr 2 in 4 out
const reaSynDr = {
  hex: '0c000000',
  bits: '00110000000000000000000000000000',
  raw: Uint8Array(4) [ 12, 0, 0, 0 ],
  uint32: 12
}

// ReaSynth
const reaSynth = {
  hex: '40 00 0000',
  bits: '00000010 00000000 0000000000000000',
  raw: Uint8Array(4) [ 64, 0, 0, 0 ],
  uint32: 64
}

// ReaComp 4 in 2 out
const reaComp = {
  hex: '54 00 00 00',
  bits: '00101010 00000000 0000000000000000',
  raw: Uint8Array(4) [ 84, 0, 0, 0 ],
  uint32: 84
}

// TCom 2/3 in, 2 out
const tCompressor = {
  hex: '5f040000',
  bits: '11111010 00100000 0000000000000000',
  raw: Uint8Array(4) [ 95, 4, 0, 0 ],
  uint32: 1119
}

// Tyrell N6
const tyrell = {
  hex: 'cb0b0000',
  bits: '11010011 11010000 0000000000000000',
  raw: Uint8Array(4) [ 203, 11, 0, 0 ],
  uint32: 3019
}

// Podolski 2 out only
const podo = {
  hex: '500d0000',
  bits: '00001010 10110000 0000000000000000',
  raw: Uint8Array(4) [ 80, 13, 0, 0 ],
  uint32: 3408
}

// Dexed (midi)
const dexed = {
  hex: 'c1 17 00 00',
  bits: '10000011 11101000 0000000000000000',
  raw: Uint8Array(4) [ 193, 23, 0, 0 ],
  uint32: 6081
}

// Zebra2 0 in, 2 out
const zebra2 = {
  hex: '5d 6f 0000',
  bits: '101110101 1110110 0000000000000000',
  raw: Uint8Array(4) [ 93, 111, 0, 0 ],
  uint32: 28509
}
```