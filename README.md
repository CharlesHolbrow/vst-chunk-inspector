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
  - VstPlugin's "ClassID" in hex. This has to be correct for the plugin to load

I would like to retrieve VST3 ClassIDs and from JUCE. Unfortunately, this is [not currently possible](https://forum.juce.com/t/how-to-get-vst3-class-id-aka-cid-aka-component-id/41041/3).

Be careful not to confuse the VST3 ClassID with the ID of the VST Components. The Tracktion VST3 plugin EditControllerIDs look VERY similar to the ClassIDs. Other plugins I've tested do not work this way.

```
// TEqualizer:
Tracktion EditControllerID: 5653 45 455173722374657175616C6973
ClassID:                    5653 54 455173722374657175616C6973

// TStereo Delay
Tracktion EditControllerID: 5653 45 5344656C237473746572656F20
ClassID:                    5653 54 5344656C237473746572656F20
```

### Block 1

My [post on the forums](https://forum.cockos.com/showthread.php?t=240523) got an answer with more details about the first block.

This post on the forum describes some of it:
https://forum.cockos.com/showpost.php?p=1592318&postcount=169

And a summary of the same info is here:
https://forum.cockos.com/showthread.php?t=195251&highlight=vst+chunk

The wiki has a [little info](https://wiki.cockos.com/wiki/index.php/State_Chunk_Definitions), but it's not super helpful

### Block 2

The raw VST plugin state. For VST3 plugins, there is an extra 8 bytes at the beginning of the chunk

```
// REAPER adds 8 bytes  | on the 9th byte, the VST state as reported by the plugin begins. I verified by comparing with with my own plugin host.
B1 0C 00 00 01 00 00 00 AD 0C 00 00 23 70 67 6D ... // U-He Podolski VST3
EC 08 00 00 01 00 00 00 56 73 74 57 00 00 00 08 ... // Tracktion #TEqualizer VST3
02 05 00 00 01 00 00 00 56 73 74 57 00 00 00 08 ... // Tracktion #TStereo Delay VST3
CD 11 00 00 01 00 00 00 C9 11 00 00 23 70 67 6D ... // U-He zebralette VST3
F3 67 00 00 01 00 00 00 EF 67 00 00 23 70 67 6D ... // U-He Zebra2 VST3
```

Schwa [Answered](https://forum.cockos.com/showpost.php?p=2327240&postcount=3) my questions about what these bytes are for.

According to the [VST3 Persistence FAQ](https://steinbergmedia.github.io/vst3_doc/vstsdk/faq.html#faqPersistence) VST3 State is stored in two chunks.
1. the `Vst::IComponenet` state `component->getState (compState)`
2. the `Vst::IEditController` state `controller->getState (ctrlState)`

The first four four bytes show the length of the IComponent state. I believe that in `SingleComponentEffect`, the state will be the same for both, because they are in effect, the same object.

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

# Other Notes about VST3 Persistence

## Hosts: saving and loading state

- [VST API Docs -> Persistence](https://steinbergmedia.github.io/vst3_doc/vstinterfaces/index.html#Persistence)
- [VST API FAQ -> How Does Persistence Work?](https://steinbergmedia.github.io/vst3_doc/vstsdk/faq.html#faqPersistence)

When saving state, the host follows this order:

1. `iComponentInstance->getState (compState)`
2. `iEditControllerInstance->getState (ctrlState)`

When loading state, the host follows this order:

1. `iComponentInstance->setState (compState)`
2. `iEditControllerInstance->setComponentState (compState)`
3. `iEditControllerInstance->setState (ctrlState)`

Always handle the `Vst::IComponent` first

## Preset Files:

In the [Preset File Documentation](https://steinbergmedia.github.io/vst3_doc/vstsdk/classSteinberg_1_1Vst_1_1PresetFile.html)
It looks like you can use the `getEntry` method to get any of:

- `Steinberg::Vst::kHeader`
- `Steinberg::Vst::kComponentState`
- `Steinberg::Vst::kControllerState`
- `Steinberg::Vst::kProgramData`
- `Steinberg::Vst::kMetaInfo`
- `Steinberg::Vst::kChunkList`
- `Steinberg::Vst::kNumPresetChunks`

These return an [`Entry`]() struct, which is a way of pointing to a byte range in the preset file.
```
ChunkID 	id
TSize 	offset
TSize 	size
```

# VST2

### First line:
```
<VST "VSTi: Podolski (u-he)" Podolski.vst 0 "" 1349477487<565354506F646F706F646F6C736B6900> ""
```

- Token: `VST`
- Name: `"VSTi: Podolski (u-he)"`
- Filename: `Podolski.vst`
- Unknown Number: `0`
- Custom name (if renamed) `""`
- ID `1349477487<565354506F646F706F646F6C736B6900>`
  - int `1349477487` This is the same as JUCE's `PluginDescription::uid`, which is an `int` data type. If we convert that to a little-endian int, the binary representation is equavalent to `Podo` in ASCII.
  - Hex: `<565354506F646F706F646F6C736B6900>` This spells out `VSTPodopodolski\x00` in hex. It does not need to be correct for the plugin to load. When reaper re-saves a session this value will be reset no matter what it was changed to.

The int id was [mentioned on the Reaper forum]](https://forum.cockos.com/showthread.php?t=193665), but it looks like the post is out of date.

### Block 1

I presume this is the same as for VST3

### Block 2

I have been able to get this state from JUCE.

## Block 3

Podolski's output: `AGluaXRpYWxpemUAEAAAAA==`, which translates to the following Hex

```
00 69 6e 69 74 69 61 6c 69 7a 65 00 10 00 00 00 // hex
00                               00 10 00 00 00
   69 6e 69 74 69 61 6c 69 7a 65
   i  n  i  t  i  a  l  i  z  e                 // ascii
```

A subset of the bytes spell out the preset name.

Here's another example from ReaComp VST2

```javascript
Buffer.from('AHN0b2NrIC0gc3RlYWR5IHJvY2sga2ljawAAAAAA', 'base64').toString('ascii')
// Result: '\x00stock - steady rock kick\x00\x00\x00\x00\x00'
```

I do not know what the other `0x00` and `0x01` bytes are... They do not seem to contain the program number as I suspected.
