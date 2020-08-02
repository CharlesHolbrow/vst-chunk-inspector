# vst-chunk-inspector

Hacks for studying how to read and write the state of VSTs to and from DAW sessions.

# Current Results

**To get Reaper Chunks:** Manually copy a string from a `.RPP` file in `parse-reaper-strings.js`

**To get Tracktion VST chunks:** use the `fluid.plugin.report` method as outlines in `get-tracktion-strings.js`

**Current VST2 results:**  Reports generated from tracktion have a `.vst2State` field, the contents of which look exactly like the contents of the *second* base64 chunk in a `.RPP` VST item (31 July 2020)

**Current VST3 results:** Reports generated from tracktion have a `.vst3State` field. Its contents look similar to the *second* base64 chunk in a `.RPP` VST item. However, the Reaper version has additional 8 bytes of data at the beginning, and another additional 8 bytes of data at the end of the chunk. These additional bytes are not present in the results aquired in a tracktion report (31 July, 2020). More research is needed to identify the meaning of these extra bytes.

# Reaper

For each VST2 or VST3 instance, Reaper stores three Base64 encoded blocks. Its unclear exactly how these three blocks are delimited.

### First Line 

VST3 example
```
<VST "VST3: #TStereo Delay (Tracktion)" "#TStereo Delay.vst3" 0 "" 1997878177{5653545344656C237473746572656F20} ""
```
1. Name: `"VST3: #TStereo Delay (Tracktion)"`
2. `"#TStereo Delay.vst3"`
3. `0` 
4. Custom Name (If pulgin is renamed): `""`
5. Plugin ID. for VST3: `1997878177` and `{5653545344656C237473746572656F20}`
  - Reaper's ID, which can be found in `reaper-vstplugins64.ini` in `~/Library/Application Support/Reaper` on Mac. Initial tests show that its okay if this is incorrect.
  - Strongly suspect: VstPlugin's "ClassID", and Base64 encoded. This has to be correct for the plugin to load

Tracktion VST3 EditControllerIDs are VERY similar (one character off) to that second number reported in reaper

U-He VST3 Edit ControllerIDs are appear to not be related to tracktion's values.

#### TEqualizer
```
Tracktion: 5653 45 455173722374657175616C6973
Reaper:    5653 54 455173722374657175616C6973
```

#### Podolski
```
Tracktion Processor ID: 565345455173722374657175616c6973
Reaper:                 D39D5B69D6AF42FA12345678506F646F
Track Edit ControllerID:DCD7BBE37742448DA874AACC979C759E
```

#### TStereo Delay
```
Trak Processor ID: 42043F99B7DA453CA569E79D9AAEC33D
Trak Edit Controller ID: 5653 45 5344656C237473746572656F20
Reaper:                  5653 54 5344656C237473746572656F20
```

### Block 1

My [post on the forums](https://forum.cockos.com/showthread.php?t=240523) got an answer with more details about the first block.

This post on the forum describes some of it:
https://forum.cockos.com/showpost.php?p=1592318&postcount=169

And a summary of the same info is here:
https://forum.cockos.com/showthread.php?t=195251&highlight=vst+chunk

The wiki has a [little info](https://wiki.cockos.com/wiki/index.php/State_Chunk_Definitions), but it's not super helpful

### Block 2

The raw VST plugin state. For VST3 plugins, there is a mysterious extra 8 bytes at the beginning and end of the chunk. 

In a preliminary test, The last 8 bytes were all `0x00`. However, the second byte of the first 8 bytes is critical for loading the plugin correctly.

```
// REAPER adds 8 bytes  | on the 9th byte, the VST state as reported by the plugin begins. I verified by comparing with with my own plugin host.
B1 0C 00 00 01 00 00 00 AD 0C 00 00 23 70 67 6D ... // U-He Podolski VST3
EC 08 00 00 01 00 00 00 56 73 74 57 00 00 00 08 ... // Tracktion #TEqualizer VST3
02 05 00 00 01 00 00 00 56 73 74 57 00 00 00 08 ... // Tracktion #TStereo Delay VST3
CD 11 00 00 01 00 00 00 C9 11 00 00 23 70 67 6D ... // U-He zebralette VST3
F3 67 00 00 01 00 00 00 EF 67 00 00 23 70 67 6D ... // U-He Zebra2 VST3
```

### Block 3

No one know what this is for.

# Tracktion Engine and Tracktion Waveform

My [initial experiments](https://github.com/CharlesHolbrow/vst-chunk-inspector) show that 
Tracktion puts a 160 byte header before the actual VST data. This is based off only one
test using an unmodified instantiation of `#TCompressor`.  Otherwise the binary data
matches the [second line](https://github.com/CharlesHolbrow/vst-chunk-inspector/blob/master/simple.RPP#L159-L170)
of the Base64 saved in a RPP chunk.

Note that the XML files that Waveform uses to store XML use a weird JUCE-speciffic 
Base64 encoding. I used the Fluid Engine to extract conventional Base64. 

# Notes about Plugin IDs in VST3

According to [How to add/create your own VST 3 plug-ins](https://steinbergmedia.github.io/vst3_doc/vstinterfaces/addownplugs.html) you typically have two different IDs that define different parts of your plugin. A **Processor ID** and a **Controller ID**. 
```
static const FUID MyProcessorUID  (0x2A0CC26C, 0xBF88964C, 0xB0BFFCB0, 0x554AF523);
static const FUID MyControllerUID (0xB9DBBD64, 0xF7C40A4C, 0x9C8BFB33, 0x8761E244);
```

[A Stackoverflow post about plugin instantiation](https://stackoverflow.com/a/55653212/702912), describes two ID types that are accessible to the plugin hosts:

- **CID** aka **Class-ID** aka **Component ID**, which identifies the plugin to the actual host. ([docs](https://steinbergmedia.github.io/vst3_doc/vstsdk/structVST3_1_1Hosting_1_1ClassInfo_1_1Data.html), [VST-MA: CID vs. IID](https://steinbergmedia.github.io/vst3_doc/base/index.html#iid))
- **IID** is aka **interface-id** which identifies an interface class. Tthe `Vst::IComponent` interface, has the id hard coded in the VST SDK:

```c++
// ivstcomponent.h
DECLARE_CLASS_IID (IComponent, 0xE831FF31, 0xF2D54301, 0x928EBBEE, 0x25697802)
```

# VST3 Interface IDs

I think that the "I" in "IComponent", "IAudioProcessor", and "IEditController" stands for "Interface". The docs contain [a list of other Interfaces](https://steinbergmedia.github.io/vst3_doc/vstinterfaces/group__vstIPlug.html) that plugins can implement.


