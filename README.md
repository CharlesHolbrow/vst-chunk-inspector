# vst-chunk-inspector

Hacks for studying how to read and write the state of VSTs to and from DAW sessions.


# Reaper

For each VST2 instance, Reaper stores three Base64 encoded blocks

This post on the forum describes some of it:
https://forum.cockos.com/showpost.php?p=1592318&postcount=169

And a summary of the same info is here:
https://forum.cockos.com/showthread.php?t=195251&highlight=vst+chunk

The wik has a little info, but it's not super helpful
https://wiki.cockos.com/wiki/index.php/State_Chunk_Definitions

I don't totally understand how these strings are delimited.
It looks like if a strings ends Before some static character limit, that means a new 
argument is beginning.

# Tracktion Engine and Tracktion Waveform

My [initial experiments](https://github.com/CharlesHolbrow/vst-chunk-inspector) show that 
Tracktion puts a 160 byte header before the actual VST data. This is based off only one
test using an unmodified instantiation of `#TCompressor`.  Otherwise the binary data
matches the [second line](https://github.com/CharlesHolbrow/vst-chunk-inspector/blob/master/simple.RPP#L159-L170)
of the Base64 saved in a RPP chunk.

Note that the XML files that Waveform uses to store XML use a weird JUCE-speciffic 
Base64 encoding. I used the Fluid Engine to extract conventional Base64. 
