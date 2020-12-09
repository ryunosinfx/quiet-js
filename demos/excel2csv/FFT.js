class FFT {
  constructor() {
    if (!navigator.mediaDevices.getUserMedia) {
      alert('getUserMedia not supported')
      return
    }
  }
  async init(fftsize) {
    const audio = new (window.AudioContext || window.webkitAudioContext)()
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const source = audio.createMediaStreamSource(stream)
    const analyser = audio.createAnalyser();
    analyser.minDecibels = -90
    analyser.maxDecibels = -10
    analyser.smoothingTimeConstant = 0 // 0-.999 0.85 ふわっとなる
    analyser.fftSize = 1 << fftsize // min:32==1<<5 max:32768==1<<15

    source.connect(analyser)
    this.analyser = analyser
    this.resolution = audio.sampleRate / analyser.fftSize;
    const buflen = analyser.frequencyBinCount;
    this.buf = new Uint8Array(buflen);
  }

  getFreqs() {
    this.analyser.getByteFrequencyData(this.buf)
    return this.buf
  }

  getFormant(buf) {
    const thr = 50
    const formant = []

    let state = 0 // 0:<thr, 1:increse, 2:decrese (push formant when 1 -> 2)
    let bkn = 0
    for (let i = 0; i < buf.length; i++) {
      const n = buf[i]
      if (state == 0) {
        if (n >= thr) {
          state = 1
        }
      } else if (state == 1) {
        if (n < bkn) {
          formant.push([i - 1, bkn])
          if (n < thr)
            state = 0
          else
            state = 2
        }
      } else if (state == 2) {
        if (n > bkn) {
          state = 1
        } else if (n < thr)
          state = 0
      }
      bkn = n
    }
    formant.sort((a, b) => b[1] - a[1])
    for (let i = 0; i < formant.length; i++) {
      formant[i][0] *= this.resolution
    }
    return formant
  }
}

const init = async () => {
  document.body.onclick = null;
  const fftsize = 13;
  const fft = new FFT();
  await fft.init(fftsize);
  let buf = fft.getFreqs()
  let bkf = null;

  const loop = function() {
    buf = fft.getFreqs()
    for (let i = 0; i < buf.length; i++) {
      const n = buf[i]
    }
    const formant = fft.getFormant(buf)
    if (formant.length > 1) {
      const freq = formant[0][0];
      const freq2 = formant[1][0];
      bkf = Math.floor(freq + .5) + "Hz " +  Math.floor(freq2 + .5) + "Hz ";
    } else {
      bkf = null;
    }
    if(bkf){
     $("body").trigger("notice",bkf);
    }
    requestAnimationFrame(loop);
  }
  loop()
};

$("body").bind("dtmf_init",init);
