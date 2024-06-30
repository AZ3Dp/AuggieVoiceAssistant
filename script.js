const URL = 'https://teachablemachine.withgoogle.com/models/hiSl8IOc-/'
const THRESHOLD = 0.9

let listening = false

async function speak(message) {
  return new Promise((resolve, reject) => {
    let synth = window.speechSynthesis
    if (synth) {
      let utterance = new SpeechSynthesisUtterance(message)
      const voices = synth.getVoices()
      utterance.voice = voices[voices.findIndex(voice => voice.name === 'Good News')]
      utterance.rate = 1
      synth.cancel()
      synth.speak(utterance)
      utterance.onend = resolve
    } else {
      reject('speechSynthesis not supported')
    }
  })
}

function addMessage({ role, content }) {
  let message = document.createElement('div')
  message.innerText = content
  message.scrollIntoView(false)
}

window.onload = () => {
  let recognizer;

  async function createModel() {
    const checkpointURL = URL + 'model.json'
    const metadataURL = URL + 'metadata.json'

    const recognizer = speechCommands.create(
      'BROWSER_FFT',
      undefined,
      checkpointURL,
      metadataURL
    )

    await recognizer.ensureModelLoaded()

    return recognizer
  }

  async function init() {
    recognizer = await createModel()

    recognizer.listen(
      result => {
        const orpheusNoise = result.scores[1]
        if (orpheusNoise > THRESHOLD && !listening) {
          listening = true
          speak('Hey').then(() => {
            console.log("Done speaking")
            listening = false
          })
        }
      },
      {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.5
      }
    )
  }

  init()
}