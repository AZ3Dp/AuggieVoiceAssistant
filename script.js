const URL = 'https://teachablemachine.withgoogle.com/models/hhOOltFqB/'
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
  document.getElementById("messages").appendChild(message);

  if (role === 'user') message.classList.add('user')
  else message.classList.add('system')
  document.getElementById('messages').appendChild(message)
  message.scrollIntoView(false) // Scroll to the message
}

window.onload = () => {
  let recognizer;
  
  async function hear() {
    return new Promise((resolve, reject) => {
      let SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      let recognition = new SpeechRecognition()
      recognition.start()
      recognition.addEventListener('result', function (event) {
        let current = event.resultIndex
        let transcript = event.results[current][0].transcript
        recognition.stop()
        resolve(transcript)

      })
    })
  }
  
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
          speak('Hey!').then(() => {
              document.getElementById('result').style.display = 'block'
            hear().then(response => {
              document.getElementById('result').style.display = 'none'

              let message = { role: 'user', content: response }
              addMessage(message)
              document.getElementById('loading').style.display = 'block'
            })
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

let messages = []