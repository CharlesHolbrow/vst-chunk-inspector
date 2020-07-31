const fs = require('fs');

const tCompState00 = {
    first: `<VST "VST: #TCompressor (Tracktion)" "#TCompressor.vst" 0 "" 1131375984<565354436F6D702374636F6D70726573> ""`,
    b1: "cG1vQ+5e7f4DAAAAAQAAAAAAAAACAAAAAAAAAAQAAAAAAAAAAgAAAAEAAAAAAAAAAgAAAAAAAABfBAAAAQAAAAAAEAA=",
    b2: "UFJPR1JBTQABBHBsdWdpbklEAAENBVRDb21wcmVzc29yAHByb2dyYW1EaXJ0eQABAQNjdXJyZW50UHJvZ3JhbQABEQVGYWN0b3J5IERlZmF1bHQAcHJvZ3JhbUlEAAABGFBBUkFNAAECaWQAAQgFYXR0YWNrAHZhbHVlAAEJBAAAAAAAAElAAFBBUkFNAAECaWQAARAFYXV0b01ha2VVcEdhaW4AdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABDgVkeW5hbWljc01vZGUAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABCAVlbmFibGUAdmFsdWUAAQkEAAAAAAAA8D8AUEFSQU0AAQJpZAABEQVmaWx0ZXJGcmVxdWVuY3kAdmFsdWUAAQkEAAAAAACAe0AAUEFSQU0AAQJpZAABDAVmaWx0ZXJHYWluAHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAAQkFZmlsdGVyUQB2YWx1ZQABCQQAAACA///vPwBQQVJBTQABAmlkAAENBWZpbHRlclNoYXBlAHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAAQ0FZmlsdGVyU3RhdGUAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABBgVob2xkAHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAAQsFaW5wdXRHYWluAHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAAQcFbGltaXQAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABCwVsb29rYWhlYWQAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABDAVtYWtlVXBHYWluAHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAAQ4FbWF4U3VtRGV0ZWN0AHZhbHVlAAEJBAAAAAAAAAAAAFBBUkFNAAECaWQAARIFbW9uaXRvclNpZGVjaGFpbgB2YWx1ZQABCQQAAAAAAAAAAABQQVJBTQABAmlkAAEHBXJhdGlvAHZhbHVlAAEJBAAAAOD///8/AFBBUkFNAAECaWQAAQkFcmVsZWFzZQB2YWx1ZQABCQQAAAAAAEB/QABQQVJBTQABAmlkAAEJBXJtc1BlYWsAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABCgVzb2Z0Q2xpcAB2YWx1ZQABCQQAAAAAAAAAAABQQVJBTQABAmlkAAETBXNvZnRDbGlwVGhyZXNob2xkAHZhbHVlAAEJBAAAAAAAABjAAFBBUkFNAAECaWQAAQoFc29mdEtuZWUAdmFsdWUAAQkEAAAAAAAAAAAAUEFSQU0AAQJpZAABCwV0aHJlc2hvbGQAdmFsdWUAAQkEAAAAAAAAPsAAUEFSQU0AAQJpZAABDgV1c2VTaWRlY2hhaW4AdmFsdWUAAQkEAAAAAAAAAAAA",
    b3: "AEZhY3RvcnkgRGVmYXVsdAAQAAAA",
}

// ReaComp in its initial unaltered state
const reaCompState00 = {
    first: `<VST "VST: ReaComp (Cockos)" reacomp.vst.dylib 0 "" 1919247213<5653547265636D726561636F6D700000> ""`,
    // What modifies this first line?
    // - Changing the preset changed the very end of the first base64 line,
    // - Toggling the "UI" button (show parameter faders instead of UI) (also end)
    // - Changing the Routing matrix (changes near the middle)
    // Things I thought might change the first, line, but did not:
    // - Wet % knob (next to "UI" button)  WET 0
    // - Bypass checkbox (next to "Wet" knob) BYPASS 1 0 0
    b1: `bWNlcu9e7f4EAAAAAQAAAAAAAAACAAAAAAAAAAQAAAAAAAAACAAAAAAAAAACAAAAAQAAAAAAAAACAAAAAAAAAFQAAAAAAAAAAAAQAA==`,
    //  `776t3g3wrd` this stays the same when I adjust the "threshold" param the next 6 characters change
    b2: `776t3g3wrd4AAIA/AAAAAKabxDsK16M8AAAAAAAAAAAAAIA/AAAAAAAAAAAAAAAAnNEHMwAAgD8AAAAAzcxMPQAAAAAAAAAAAAAAAAAAgD4AAAAA`,
    b3: `AAAQAAAA`
}

// ReaComp with all its parameters maxed out
const reaCompState01 = {
    first: `<VST "VST: ReaComp (Cockos)" reacomp.vst.dylib 0 "" 1919247213<5653547265636D726561636F6D700000> ""`,
    b1: `bWNlcu9e7f4EAAAAAQAAAAAAAAACAAAAAAAAAAQAAAAAAAAACAAAAAAAAAACAAAAAQAAAAAAAAACAAAAAAAAAFQAAAAAAAAAAAAQAA==`,
    b2: `776t3g3wrd7hyX5AAACAPwAAgD8AAIA/AACAPwAAAAAAAIA/AACAPwAAAAAAAAAA4cl+QOHJfkAAAAAAAAAgQQAAgD8AAAAAAAAAAAAAgD4AAAAA`,
    b3: `AAAQAAAA`,
}

// ReaComp in initial state with additional inputs (created in the 2-in-4 out button)
const reaCompState02 = {
    first: `<VST "VST: ReaComp (Cockos)" reacomp.vst.dylib 0 "" 1919247213<5653547265636D726561636F6D700000> ""`,
    b1: `bWNlcu9e7f4EAAAAAQAAAAAAAAACAAAAAAAAAAQAAAAAAAAACAAAAAAAAAACAAAAAQAAAAAAAAACAAAAAAAAAFQAAAAAAAAAAAAQAA==`,
    b2: `776t3g3wrd4AAIA/AAAAAKabxDsK16M8AAAAAAAAAAAAAIA/AAAAAAAAAAAAAAAAnNEHMwAAgD8AAAAAzcxMPQAAAAAAAAAAAAAAAAAAgD4AAAAA`,
    b3: `AAAQAAAA`,
}


const buffer1 = Buffer.from(tCompState00.b1, 'base64');
const buffer2 = Buffer.from(tCompState00.b2, 'base64');
const writeStream1 = fs.createWriteStream('tCompState-fromReaper-1');
const writeStream2 = fs.createWriteStream('tCompState-fromReaper-2');
writeStream1.write(buffer1);
writeStream2.write(buffer2);

`
4 bytes <VSTID>
4 bytes <magic value?>
4 bytes <Number of Inputs>
* after that, a bitmask array of 8 bytes each, for the input routings (bit 0 = input channel 1 is set; bit 63 = input channel 64 is set; etc)
* the length of the above array is defined by the number of inputs (so total size is 8*NumInputs bytes)

4 bytes <Number of Outputs>
* again bitmask array 8 bytes each for outputs this time...

Then follows the VST stuff (which you aren't interested in).
`
