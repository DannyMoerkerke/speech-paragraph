# speech-paragraph
A Custom Element that extends the native paragraph HTML element `<p>` to enable it to read its text out loud using 
[Web SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

Usage:
```
<script type="module" src="/src/speech-paragraph.js"></script>

<p is="speech-paragraph">
  This text will be read out loud.
</p>
```

In browsers that don't support extending native HTML elements, the element `speech-paragraph` can be used:

```
<script type="module" src="/src/speech-paragraph.js"></script>

<speech-paragraph>
  This text will be read out loud.
</speech-paragraph>
```

A play button will appear in the top-right corner of the paragraph. 
When pressed, the text of the paragraph will be read out loud and the play button will change into a pause button.

To cancel speaking instead of pausing, click outside the paragraph.

You can also select a portion of text inside the paragraph to play. In that case, the play button will appear at the 
start of the selection.

### Selecting a language
The default language is US English, but you can specify the language with the `lang` attribute which takes as value a
BCP 47 language tag.

For example: `en-US` or simply `en`.

```
<p is="speech-paragraph" lang="en-US">
```
```
<speech-paragraph lang="en-US">
```

### Selecting a voice
For every language, the browser provides an array of available voices. A voice from this array can by chosen by specifying 
its `name` in the `voice` attribute.

To get the array of available voices, get a reference to the element and inspect the `voices` property. The easiest way 
to do this is to click the element in the Elements panel of your browser's dev tools which will assign it to the special
`$0` variable:

```
$0.voices
```
which will show the array of available voices like this:
```
0: SpeechSynthesisVoice {voiceURI: 'Alex', name: 'Alex', lang: 'en-US', localService: true, default: true}
1: SpeechSynthesisVoice {voiceURI: 'Fred', name: 'Fred', lang: 'en-US', localService: true, default: false}
2: SpeechSynthesisVoice {voiceURI: 'Samantha', name: 'Samantha', lang: 'en-US', localService: true, default: false}
3: SpeechSynthesisVoice {voiceURI: 'Victoria', name: 'Victoria', lang: 'en-US', localService: true, default: false}
4: SpeechSynthesisVoice {voiceURI: 'Google US English', name: 'Google US English', lang: 'en-US', localService: false, default: false}
```

A voice is selected by specifying its `name` property, so to select "Victoria":
```
<p is="speech-paragraph" lang="en-US" voice="Victoria">
```
```
<speech-paragraph lang="en-US" voice="Victoria">
```
### Setting the playback speed
The speech at which the text is spoken can be set with the `rate` attribute. It accepts a value between 0.5 and 1.5.
The default value is 1.

```
<p is="speech-paragraph" rate="0.8>
```
```
<speech-paragraph rate="0.8>
```

### Styling
The component exposes the following CSS custom properties for styling :

- `--button-size`: size of the play and pause button. Default: `12px`
- `--button-color`: color  of the play and pause button. Default: `#000000`
- `--text-highlight-color`: background color of selected text inside the element. Default: `#ffff00`

### Demo
To run the demo, run `npm install` once and then `npm start` and view the demo at 
[http://localhost:8080](http://localhost:8080)
